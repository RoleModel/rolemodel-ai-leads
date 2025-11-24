-- Create leads table to store qualified lead summaries
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  visitor_name TEXT,
  visitor_email TEXT,
  summary JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX idx_leads_conversation ON leads(conversation_id);
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_leads_email ON leads(visitor_email);
