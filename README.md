# RoleModel AI Leads Chatbot

An intelligent lead generation chatbot built with Next.js, AI SDK, and Supabase. Features both standalone chat pages and embeddable widgets for Framer sites.

## Features

- ✅ **Playground**: Test your chatbot with a full chat interface
- ✅ **Sources**: Add training data (text, files, websites, Q&A)
- ✅ **Deploy**: Standalone chat pages and embeddable widgets
- ✅ **Activity**: View all conversations and message history
- ✅ **Analytics**: Track performance metrics
- ✅ **RAG (Retrieval-Augmented Generation)**: Context-aware responses using vector search
- ✅ **Optics Design System**: Professional, class-based CSS styling (no Tailwind)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: AI SDK with AI Gateway support
- **Database**: Supabase (PostgreSQL + pgvector)
- **Styling**: Optics Design System
- **Deployment**: Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd rolemodel-ai-leads
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your keys
3. Go to SQL Editor and run the schema from `/supabase/schema.sql`
4. (Optional) Run `/scripts/seed-knowledge.sql` to add sample RoleModel knowledge base

### 3. Configure Environment Variables

Copy `.env.local` and fill in your credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Gateway (recommended)
AI_GATEWAY_API_KEY=your_ai_gateway_key
AI_GATEWAY_ACCOUNT_ID=your_cloudflare_account_id

# OpenAI (fallback)
OPENAI_API_KEY=your_openai_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/playground](http://localhost:3000/playground)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat completions with RAG
│   │   ├── sources/       # Source management
│   │   ├── conversations/ # Activity data
│   │   ├── analytics/     # Metrics
│   │   └── chatbot/       # Chatbot config
│   ├── playground/        # Main chat interface
│   ├── sources/           # Knowledge base management
│   ├── activity/          # Conversation viewer
│   ├── analytics/         # Dashboard
│   ├── deploy/            # Embed codes
│   ├── chat/[id]/         # Standalone chat page
│   └── widget/[id]/       # Widget iframe page
├── components/
│   ├── chat/              # Chat UI components
│   └── layout/            # App shell components
└── lib/
    ├── ai/                # AI Gateway, embeddings, RAG
    └── supabase/          # Database clients
```

## Usage Guide

### Adding Knowledge Base Content

1. Go to **Sources** page
2. Add text content (PDFs, websites coming soon)
3. Content is automatically embedded for semantic search

### Testing the Chatbot

1. Go to **Playground**
2. Chat with the bot to test responses
3. Relevant sources are automatically retrieved based on context

### Deploying

1. Go to **Deploy** page
2. Copy the standalone URL to share directly
3. Copy the widget embed code for Framer:
   - In Framer, add an **Embed** component
   - Paste the widget code
   - Publish your site

### Viewing Activity

1. Go to **Activity** page
2. Click on any conversation to view full message history
3. Track user engagement and common questions

### Monitoring Analytics

1. Go to **Analytics** page
2. View total conversations, messages, and sources
3. Track activity over the last 7 days

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

## Customization

### Chatbot Configuration

Edit the default chatbot in `/supabase/schema.sql`:

```sql
UPDATE chatbots SET
  display_name = 'Your Company Name',
  initial_message = 'Your welcome message',
  instructions = 'Your custom instructions',
  business_context = 'Your company info'
WHERE id = 'a0000000-0000-0000-0000-000000000001';
```

### Styling

All styling uses Optics Design System classes. Customize in `/src/app/globals.css`:

```css
:root {
  --op-color-primary-base: #your-color;
  --op-font-family: 'Your Font';
}
```

## AI Gateway Setup

Using Cloudflare AI Gateway provides:

- Request caching
- Analytics
- Rate limiting
- Cost optimization

1. Create an account at [cloudflare.com](https://cloudflare.com)
2. Set up AI Gateway
3. Get your Account ID and Gateway API key
4. Add to `.env.local`

## Troubleshooting

### Vector search not working

Make sure pgvector extension is enabled in Supabase:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Embeddings failing

Check your AI Gateway / OpenAI API key is correct and has sufficient credits.

### Widget not displaying

Make sure the embed code domain matches your deployment URL. Update in `/src/app/deploy/page.tsx`.

## License

Proprietary - RoleModel Software

## Support

For questions or issues, contact: hello@rolemodelsoftware.com
