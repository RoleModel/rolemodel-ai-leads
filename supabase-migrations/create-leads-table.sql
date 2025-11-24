-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  visitor_name TEXT,
  visitor_email TEXT,
  summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on conversation_id for faster lookups
CREATE INDEX IF NOT EXISTS leads_conversation_id_idx ON public.leads(conversation_id);

-- Create index on created_at for date filtering
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads(created_at);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on leads" ON public.leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add lead_captured column to conversations table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations'
    AND column_name = 'lead_captured'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN lead_captured BOOLEAN DEFAULT false;
  END IF;
END $$;
