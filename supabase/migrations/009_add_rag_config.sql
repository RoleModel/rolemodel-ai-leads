-- Add RAG configuration to help_page_settings
-- This allows customizing how the AI uses the knowledge base

ALTER TABLE help_page_settings
ADD COLUMN IF NOT EXISTS rag_config JSONB DEFAULT '{
  "sourceLimit": 5,
  "similarityThreshold": 0.5,
  "enableCitations": true,
  "enableCaseStudies": true,
  "citationStyle": "numbered",
  "enableBANT": true,
  "askForName": true,
  "askForEmail": true,
  "maxQuestions": 5,
  "responseConciseness": "moderate",
  "enablePersonalization": true,
  "customInstructions": ""
}'::jsonb;

-- Add a comment to document the structure
COMMENT ON COLUMN help_page_settings.rag_config IS 'RAG configuration: {sourceLimit: number, similarityThreshold: number, enableCitations: boolean, enableCaseStudies: boolean, citationStyle: string, enableBANT: boolean, askForName: boolean, askForEmail: boolean, maxQuestions: number, responseConciseness: string, enablePersonalization: boolean, customInstructions: string}';
