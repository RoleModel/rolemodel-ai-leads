-- Add email_sent_at column to conversations table
-- This prevents duplicate email summary sends

ALTER TABLE conversations
ADD COLUMN email_sent_at TIMESTAMP WITH TIME ZONE;
