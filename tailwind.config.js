/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Supabase brand colors (keeping your orange customization)
        brand: {
          DEFAULT: '#FFA500', // Your custom orange
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FFA500',
          600: '#e6940a',
          700: '#cc8309',
          800: '#b37208',
          900: '#92400e',
        },
        
        // Supabase scale colors (grayscale system)
        scale: {
          0: '#ffffff',    // Pure white
          100: '#fafafa',  // Very light gray  
          200: '#f4f4f5',  // Light gray
          300: '#e4e4e7',  // Light gray
          400: '#d4d4d8',  // Medium light gray
          500: '#a1a1aa',  // Medium gray
          600: '#71717a',  // Medium dark gray
          700: '#52525b',  // Dark gray
          800: '#3f3f46',  // Very dark gray
          900: '#27272a',  // Nearly black
          1000: '#18181b', // Very dark
          1100: '#0c0c0d', // Almost black
          1200: '#000000', // Pure black
        },
        
        // Supabase specific surface colors
        surface: {
          100: '#fafafa',
          200: '#f4f4f5',
          300: '#e4e4e7',
        },
        
        // Alternative background (for data grids, etc.)
        alternative: '#f8fafc',
        
        // Overlay background
        overlay: 'rgba(0, 0, 0, 0.8)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}