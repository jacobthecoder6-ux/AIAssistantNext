# Ultimate Multilingual AI Chatbot

## Overview

This is a full-stack multilingual AI chatbot application built with React, TypeScript, Express.js, and PostgreSQL. The application integrates with both OpenAI and Anthropic APIs to provide AI-powered conversations, code assistance, math problem solving, and image generation capabilities. The chatbot supports multiple languages and includes user authentication, persistent chat history, and specialized chatbot creation features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Components**: Custom component library built on Radix UI primitives with Tailwind CSS
- **State Management**: React hooks with local storage for persistence
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom theme system supporting light, dark, and blue themes
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query) for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with centralized error handling
- **Development**: Hot reloading with Vite integration in development mode

### Database Design
- **Primary Database**: PostgreSQL via Neon serverless
- **Schema Management**: Drizzle migrations with schema-first approach
- **Key Tables**:
  - `users`: User accounts with preferences and API keys
  - `chats`: Chat sessions with metadata
  - `messages`: Individual chat messages
  - `specializedChatbots`: Custom chatbot configurations
  - `codeSnippets` & `promptTemplates`: Reusable content storage

### Authentication & Authorization
- **Authentication**: Google OAuth integration with @react-oauth/google
- **Session Management**: Simple password-based access control
- **Security**: API keys stored locally in browser, never sent to backend servers
- **User Preferences**: Persistent storage of language, theme, and model preferences

### AI Integration Architecture
- **Multi-Provider Support**: Pluggable architecture supporting OpenAI and Anthropic APIs
- **Model Selection**: Dynamic model switching (GPT-4o, Claude 3.7 Sonnet, etc.)
- **Specialized Features**:
  - Code assistance with syntax highlighting
  - Math problem solving with step-by-step explanations  
  - Image generation via DALL-E 3
  - Language detection and multilingual responses

### UI/UX Design System
- **Design Language**: Professional theme with consistent spacing and typography
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Accessibility**: ARIA-compliant components from Radix UI
- **Theme System**: CSS custom properties with automatic dark mode detection
- **Component Architecture**: Compound components with consistent prop interfaces

## External Dependencies

### Core AI Services
- **OpenAI API**: GPT models for text generation, code assistance, math solving, and DALL-E for images
- **Anthropic API**: Claude models as alternative text generation provider

### Database & Infrastructure  
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time features via native WebSocket implementation

### Authentication & Social
- **Google OAuth**: User authentication and profile management
- **React OAuth Google**: Frontend OAuth integration library

### Development & Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first styling framework
- **PostCSS**: CSS processing and optimization
- **ESBuild**: Fast JavaScript bundling for production

### UI Component Libraries
- **Radix UI**: Headless, accessible component primitives
- **Lucide React**: Consistent icon system
- **Framer Motion**: Animation library for enhanced UX
- **React Hook Form**: Form state management and validation
- **Date-fns**: Date manipulation and formatting

### Utility Libraries
- **Drizzle Kit**: Database schema management and migrations
- **UUID**: Unique identifier generation
- **clsx & tailwind-merge**: Dynamic className composition
- **Zod**: Runtime type validation and schema definition