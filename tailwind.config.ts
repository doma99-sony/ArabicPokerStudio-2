import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        "bounce-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(5px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "float": {
          "0%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
          "100%": { transform: "translateY(0px) rotate(0deg)" },
        },
        "float-slow": {
          "0%": { transform: "translateX(0) translateY(0)" },
          "33%": { transform: "translateX(20px) translateY(-10px)" },
          "66%": { transform: "translateX(-20px) translateY(10px)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
        "float-slow-reverse": {
          "0%": { transform: "translateX(0) translateY(0)" },
          "33%": { transform: "translateX(-20px) translateY(-5px)" },
          "66%": { transform: "translateX(20px) translateY(10px)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
        "santa-fly": {
          "0%": { transform: "translateX(-20vw) translateY(0)" },
          "25%": { transform: "translateX(0vw) translateY(-10vh)" },
          "50%": { transform: "translateX(20vw) translateY(0)" },
          "75%": { transform: "translateX(40vw) translateY(-5vh)" },
          "100%": { transform: "translateX(120vw) translateY(0)" },
        },
        "snow": {
          "0%": { transform: "translateY(0) rotate(0deg)" },
          "100%": { transform: "translateY(100vh) rotate(360deg)" },
        },
        "glitter": {
          "0%, 100%": { boxShadow: "0 0 5px 2px rgba(255, 215, 0, 0.7)" },
          "50%": { boxShadow: "0 0 20px 5px rgba(255, 215, 0, 0.9)" },
        },
        "lightning-flash": {
          "0%, 100%": { 
            backgroundColor: "rgba(255, 255, 255, 0)",
            opacity: "0"
          },
          "0.5%, 1.5%": { 
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            opacity: "0.9"
          },
          "2%": { 
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            opacity: "0.3"
          },
          "3%, 4.5%": { 
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            opacity: "0.9"
          },
          "5%": { 
            backgroundColor: "rgba(255, 255, 255, 0)",
            opacity: "0"
          }
        },
        "lightning-streak-anim": {
          "0%, 100%": { 
            opacity: "0"
          },
          "0.5%, 1.5%": { 
            opacity: "1"
          },
          "2%": { 
            opacity: "0.3"
          },
          "3%, 4.5%": { 
            opacity: "1"
          },
          "5%": { 
            opacity: "0"
          }
        },
        "lightning-glow-anim": {
          "0%, 100%": { 
            opacity: "0"
          },
          "0.5%, 4.5%": { 
            opacity: "0.8"
          },
          "5%": { 
            opacity: "0"
          }
        },
        "thunder-shake-anim": {
          "0%, 100%": { 
            transform: "translateX(0)",
            opacity: "0"
          },
          "0.5%, 2.5%": { 
            transform: "translateX(-2px)",
            opacity: "1"
          },
          "1%, 3%, 4.5%": { 
            transform: "translateX(2px)",
            opacity: "1"
          },
          "1.5%, 3.5%": { 
            transform: "translateX(-1px)",
            opacity: "1"
          },
          "2%, 4%": { 
            transform: "translateX(1px)",
            opacity: "1"
          },
          "5%": { 
            transform: "translateX(0)",
            opacity: "0"
          }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "bounce-x": "bounce-x 1s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "float": "float 5s ease-in-out infinite",
        "float-slow": "float-slow 20s ease-in-out infinite",
        "float-slow-reverse": "float-slow-reverse 15s ease-in-out infinite",
        "santa-fly": "santa-fly 20s linear infinite",
        "snow": "snow 10s linear infinite",
        "glitter": "glitter 2s ease-in-out infinite",
        "lightning-effect": "lightning-flash 30s ease-in-out infinite",
        "lightning-effect-delayed": "lightning-flash 30s ease-in-out infinite",
        "lightning-effect-distant": "lightning-flash 30s ease-in-out infinite",
        "lightning-streak": "lightning-streak-anim 30s ease-in-out infinite",
        "lightning-streak-delayed": "lightning-streak-anim 30s ease-in-out infinite",
        "lightning-streak-distant": "lightning-streak-anim 30s ease-in-out infinite",
        "lightning-glow": "lightning-glow-anim 30s ease-in-out infinite",
        "lightning-glow-delayed": "lightning-glow-anim 30s ease-in-out infinite",
        "thunder-shake": "thunder-shake-anim 30s ease-in-out infinite",
        "thunder-shake-delayed": "thunder-shake-anim 30s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
