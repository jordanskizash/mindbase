#!/usr/bin/env node

/**
 * Database Setup Script for Mindbase
 * 
 * This script creates the necessary database tables in Supabase.
 * Make sure you have the SUPABASE_DB_URL environment variable set.
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Read environment variables from .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].replace(/['"]/g, '') : null;
};

const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract database connection info from Supabase URL
const url = new URL(SUPABASE_URL);
const DB_HOST = url.hostname.replace('.supabase.co', '.pooler.supabase.com');
const PROJECT_REF = url.hostname.split('.')[0];
const DB_URL = `postgresql://postgres.${PROJECT_REF}:${SERVICE_ROLE_KEY}@${DB_HOST}:5432/postgres`;

console.log('🚀 Setting up Mindbase database...');
console.log(`📡 Project: ${PROJECT_REF}`);

// Read the schema file
const schemaPath = path.join(__dirname, '..', 'lib', 'supabase', 'schema.sql');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ Schema file not found:', schemaPath);
  process.exit(1);
}

console.log('📄 Running schema.sql...');

// Execute the schema using psql
exec(`psql "${DB_URL}" -f "${schemaPath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error executing schema:', error.message);
    console.error('stderr:', stderr);
    
    console.log('\n💡 Alternative setup instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of lib/supabase/schema.sql');
    console.log('4. Run the SQL commands');
    
    process.exit(1);
  }

  if (stderr) {
    console.log('⚠️  Warnings:', stderr);
  }

  console.log('✅ Database schema created successfully!');
  console.log('🎉 You can now use the application with full database functionality.');
  console.log('\n🔍 Please test the application to verify everything is working.');
});