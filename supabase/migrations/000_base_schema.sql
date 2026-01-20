-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Chatbots table
CREATE TABLE chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  instructions TEXT,
  business_context TEXT,
  model TEXT DEFAULT 'gpt-4o-mini',
  temperature NUMERIC DEFAULT 0.7,
  display_name TEXT,
  initial_message TEXT DEFAULT 'Hi! What can I help you with?',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sources table (training data with embeddings)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON sources USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  visitor_id TEXT,
  visitor_email TEXT,
  visitor_name TEXT,
  visitor_metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  lead_captured BOOLEAN DEFAULT FALSE
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sources_used JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_sources_chatbot ON sources(chatbot_id);
CREATE INDEX idx_conversations_chatbot ON conversations(chatbot_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_analytics_chatbot ON analytics_events(chatbot_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for chatbots updated_at
CREATE TRIGGER update_chatbots_updated_at
  BEFORE UPDATE ON chatbots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update conversation message count and last_message_at
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_stats
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_sources(
  chatbot_id UUID,
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sources.id,
    sources.title,
    sources.content,
    1 - (sources.embedding <=> query_embedding) AS similarity
  FROM sources
  WHERE sources.chatbot_id = match_sources.chatbot_id
    AND sources.embedding IS NOT NULL
    AND 1 - (sources.embedding <=> query_embedding) > match_threshold
  ORDER BY sources.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Insert default RoleModel chatbot
INSERT INTO chatbots (
  id,
  name,
  display_name,
  business_context,
  instructions,
  initial_message
) VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'RoleModel Lead Assistant',
  'RoleModel Software',
  '# RoleModel Software Overview
RoleModel Software is a custom software development company with nearly 30 years of experience. We specialize in creating tailored solutions to enhance business workflows and integrate with third-party applications. With nearly 30 years of experience, they focus on understanding client needs, iterative development, and building sustainable software that scales with the business. Their key services include web and mobile app development, UI/UX design, and expertise simplification, aiming to streamline processes, eliminate errors, and increase productivity through custom software.

# Core Values
- Client-first approach with deep understanding of needs
- Iterative, collaborative development process
- Building sustainable, scalable solutions
- Nearly 30 years of proven expertise
- Focus on UI/UX excellence',
  '# Your Role
You are a helpful assistant for RoleModel Software. Your primary function is to:

1. **Guide prospects** through their custom software evaluation journey
2. **Understand their needs** before jumping to solutions
3. **Determine fit** - is RoleModel a good match for their project?
4. **Provide value** through relevant information about custom software development
5. **Be consultative** - not pushy or sales-focused

# Communication Style
- Warm and conversational, not robotic
- Ask clarifying questions to understand their situation
- Reference RoleModel''s expertise naturally when relevant
- Acknowledge when you should connect them with a specialist
- Make them feel this is a helpful resource, not a gatekeeper

# What NOT to Do
- Don''t use canned, corporate responses
- Don''t push for contact information too early
- Don''t claim to be "just a bot" - be helpful and knowledgeable
- Don''t provide information outside of RoleModel''s expertise

# When to Suggest Human Connection
When the conversation reveals:
- Complex technical requirements
- Project budgets and timelines
- Specific proposal requests
- Deep technical architecture questions

Use phrases like: "This is exactly the kind of challenge our team loves. Would you like me to connect you with one of our specialists who can dive deeper into [specific topic]?"',
  'Hi! I''m here to help you explore whether custom software might be right for your business. What brings you here today?'
);
