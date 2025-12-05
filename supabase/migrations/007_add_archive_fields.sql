-- Add archive fields to conversations and leads tables
-- This enables soft-delete functionality for archiving chat logs and leads

-- Add archive fields to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Add archive fields to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Create indexes for filtering archived items
CREATE INDEX IF NOT EXISTS idx_conversations_is_archived ON conversations(is_archived);
CREATE INDEX IF NOT EXISTS idx_leads_is_archived ON leads(is_archived);

-- Add comments for documentation
COMMENT ON COLUMN conversations.is_archived IS 'Soft delete flag - archived conversations are hidden from default views';
COMMENT ON COLUMN conversations.archived_at IS 'Timestamp when the conversation was archived';
COMMENT ON COLUMN leads.is_archived IS 'Soft delete flag - archived leads are hidden from default views';
COMMENT ON COLUMN leads.archived_at IS 'Timestamp when the lead was archived';
