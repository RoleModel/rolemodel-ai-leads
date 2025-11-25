# RoleModel AI Leads

A lead qualification and chatbot system that uses AI to engage website visitors, collect contact information, and score leads based on configurable qualification workflows.

## Architecture Overview

The system consists of three main components:

1. **Embeddable Chat Widget** - A React-based chat interface that can be embedded on external websites
2. **Workflow Designer** - Visual tool for configuring lead qualification questions and scoring
3. **RAG-Enhanced AI Backend** - GPT-4o-mini powered responses with vector search for context

---

## How the AI Conversation Works

### Chat Flow

1. User sends a message through the chat widget
2. The backend retrieves relevant context using semantic search (RAG)
3. GPT-4o-mini generates a response using:
   - System instructions from the chatbot configuration
   - Business context including workflow rules
   - Retrieved knowledge base chunks
   - Conversation history
4. Lead information is extracted from the conversation
5. Qualification score is calculated based on workflow rules

### AI Model Configuration

Located in `/src/app/api/chat/route.ts`:

- **Model**: `gpt-4o-mini`
- **Temperature**: `0.7` (default, configurable per chatbot)
- **Max Tokens**: `500` per response
- **Streaming**: Enabled for real-time responses

---

## Lead Qualification System

### How Scoring Works

The workflow designer creates qualification rules that are embedded into the chatbot's system prompt. When a workflow is saved, the system:

1. Extracts all question nodes and their configurations
2. Generates dynamic system instructions that tell the AI:
   - The specific questions to ask
   - Keywords to look for in responses
   - Scoring weights for each question
   - Qualification threshold
3. Updates the chatbot's `instructions` field in the database
4. Stores the full workflow JSON in `business_context`

The AI receives these instructions in its system prompt and naturally incorporates the questions into conversation.

### BANT Framework (Default)

The default workflow uses BANT criteria:

| Question | Weight | Keywords |
|----------|--------|----------|
| "What's your budget for this project?" | 30% | 10k, 20k, 50k+, enterprise |
| "Are you the decision maker?" | 25% | yes, no, team, committee |
| "What problems are you trying to solve?" | 20% | efficiency, cost, scale, automation |
| "When do you need this completed?" | 25% | asap, this quarter, next quarter, 6 months |

### Lead Data Extraction

After each AI response, the system calls GPT-4o-mini again to extract structured data from the conversation. This happens in `/src/app/api/chat/route.ts`:

```typescript
{
  name: string | null,
  email: string | null,
  phone: string | null,
  company: string | null,
  budget: string | null,
  timeline: string | null,
  needs: string | null,
  qualification_score: number,
  is_qualified: boolean
}
```

This extraction analyzes the full conversation to pull out any contact or qualification data the user has mentioned.

---

## Workflow Designer

Located at `/sources` page, implemented in `/src/components/admin/WorkflowDesigner.tsx`.

### Node Types

- **Entry Node** - Starting point of conversation flow (green)
- **Question Node** - Qualification question with keywords and weight (blue)
- **Outcome Node** - End state like "Qualified Lead" or "Nurture Lead" (purple/yellow)

### Edge Configuration

Edges between nodes can have:

- **Labels** - Text displayed on the connection (e.g., "Score > 70%")
- **Colors** - Custom stroke colors
- **Line Styles**:
  - `solid` - Default continuous line
  - `dashed` - Dashed line (`strokeDasharray: "5 5"`)
  - `dotted` - Dotted line (`strokeDasharray: "2 2"`)
  - `animated` - Pulsing animation effect

### How Workflow Affects AI Behavior

When you save a workflow via POST `/api/workflow`:

1. **Questions are extracted** from all question nodes
2. **Dynamic instructions are generated**:
   ```
   QUALIFICATION QUESTIONS:
   1. What's your budget for this project? (Weight: 30%)
   2. Are you the decision maker? (Weight: 25%)
   ...

   SCORING CRITERIA:
   - Look for these keywords: 10k, 20k, yes, no, efficiency...
   - Qualification threshold: 70%
   ```
3. **Instructions are appended** to the chatbot's existing instructions
4. **Workflow JSON is stored** in `business_context` field

The AI uses these instructions to guide the conversation naturally while collecting qualification data.

---

## RAG (Retrieval Augmented Generation)

Implemented in `/src/lib/ai/rag.ts`.

### How Context Retrieval Works

1. User's message is converted to a vector embedding using OpenAI's `text-embedding-3-small` (1536 dimensions)
2. pgvector performs cosine similarity search against stored document chunks
3. Top 5 most relevant chunks are retrieved (similarity threshold: 0.3)
4. Retrieved context is prepended to the AI's system prompt

### What Gets Retrieved

The RAG system searches the `documents` table for chunks matching the user's query semantically. This allows the AI to answer questions about:

- Your products/services
- Pricing information
- Company policies
- FAQ content
- Any other indexed content

---

## Database Schema

### Key Tables

**chatbots**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Display name |
| instructions | TEXT | System prompt sent to AI |
| business_context | JSONB | Workflow and additional context |
| model | VARCHAR | AI model to use |
| temperature | FLOAT | Response creativity (0-1) |

**conversations**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| chatbot_id | UUID | Foreign key to chatbots |
| lead_data | JSONB | Extracted lead information |

**messages**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| conversation_id | UUID | Foreign key to conversations |
| role | VARCHAR | "user" or "assistant" |
| content | TEXT | Message text |

**documents**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| chatbot_id | UUID | Foreign key to chatbots |
| content | TEXT | Text chunk |
| embedding | vector(1536) | Vector embedding |
| metadata | JSONB | Source information |

---

## API Endpoints

### POST /api/chat

Main chat endpoint for conversation.

**Request:**
```json
{
  "message": "User's message",
  "conversationId": "uuid (optional)",
  "chatbotId": "uuid (optional)"
}
```

**Response:** Server-sent events stream with AI response chunks

### GET /api/workflow

Retrieve workflow configuration for a chatbot.

**Query params:**
- `chatbotId` - UUID of chatbot (optional, uses default)

### POST /api/workflow

Save workflow configuration.

**Request:**
```json
{
  "chatbotId": "uuid (optional)",
  "workflow": {
    "nodes": [...],
    "qualificationThreshold": 70
  }
}
```

**What it does:**
- Extracts questions from workflow nodes
- Generates dynamic AI instructions
- Updates chatbot in database
- Stores full workflow in business_context

### POST /api/chatbot

Create or update chatbot configuration.

---

## Embedding the Widget

### Iframe Method

```html
<iframe
  src="https://your-domain.com/embed/leads-page"
  width="400"
  height="600"
  style="border: none;"
></iframe>
```

### Script Tag Method

```html
<script
  src="https://your-domain.com/embed-script.js"
  data-chatbot-id="your-chatbot-id"
></script>
```

---

## Tech Stack

- **Framework**: Next.js 15, React 19, TypeScript
- **UI Components**: Custom components with Optics Design System tokens
- **Flow Visualization**: @xyflow/react (ReactFlow)
- **AI**: OpenAI GPT-4o-mini, text-embedding-3-small
- **Database**: Supabase (PostgreSQL with pgvector)
- **Styling**: Tailwind CSS with CSS custom properties

---

## Environment Variables

```bash
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Limitations

- Lead extraction accuracy depends on how clearly users state information
- Qualification scoring is keyword-based, not semantic understanding
- RAG retrieval limited to top 5 chunks per query
- Workflow changes require saving to take effect

---

## License

Proprietary - RoleModel Software
