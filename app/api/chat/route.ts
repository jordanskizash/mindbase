import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, extractStructuredData } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = extractStructuredData 
      ? `You are a learning plan assistant. When users request learning plans, you MUST provide both conversational responses AND structured data.

IMPORTANT: You MUST always include a JSON code block with the learning plan structure.

For learning plan requests, respond with:
1. A brief conversational response explaining the plan (2-3 sentences)
2. ALWAYS include a JSON block with this EXACT structure (no deviations):

\`\`\`json
{
  "learningPlan": {
    "title": "Complete Learning Plan Title",
    "description": "Detailed description of what this plan covers",
    "duration": "8 weeks",
    "skillLevel": "Beginner",
    "totalProgress": 0,
    "modules": [
      {
        "id": "1",
        "title": "Module Title",
        "description": "What this module covers",
        "duration": "1 week",
        "completed": false,
        "progress": 0,
        "lessons": [
          {
            "id": "1-1",
            "title": "Lesson Title",
            "completed": false,
            "duration": "30 minutes"
          },
          {
            "id": "1-2",
            "title": "Another Lesson",
            "completed": false,
            "duration": "45 minutes"
          }
        ]
      }
    ],
    "resources": [
      {
        "id": "r1",
        "title": "Resource Title",
        "type": "video",
        "url": "https://example.com",
        "description": "Resource description",
        "duration": "2 hours"
      }
    ]
  }
}
\`\`\`

Create 4-5 modules with 2-3 lessons each, and 5-6 resources. Make all content specific to the user's learning request. ALWAYS end your response with the JSON block.`
      : `You are a learning plan assistant. Your role is to help users create personalized learning plans based on their requests. 

When a user asks for help with learning something:
1. Ask clarifying questions if needed
2. Create structured learning plans with clear modules/sections
3. Provide practical, actionable content
4. Suggest resources, exercises, and milestones
5. Be encouraging and supportive

Keep responses conversational but informative. Focus on creating comprehensive learning experiences.`

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    })

    const encoder = new TextEncoder()
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = ''
          
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            fullContent += content
            
            if (content) {
              const data = JSON.stringify({ 
                type: 'content', 
                content,
                fullContent 
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Extract structured data if present
          if (extractStructuredData && fullContent.includes('```json')) {
            try {
              console.log('Found JSON block, extracting structured data...')
              const jsonMatch = fullContent.match(/```json\s*([\s\S]*?)\s*```/)
              if (jsonMatch && jsonMatch[1]) {
                console.log('Matched JSON content:', jsonMatch[1])
                const structuredData = JSON.parse(jsonMatch[1])
                console.log('Parsed structured data:', structuredData)
                const data = JSON.stringify({ 
                  type: 'structured_data', 
                  data: structuredData 
                })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            } catch (e) {
              console.error('Failed to parse structured data:', e)
              console.error('Full content was:', fullContent)
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('OpenAI API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}