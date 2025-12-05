-- Add new fields for leads page flow
ALTER TABLE help_page_settings
ADD COLUMN IF NOT EXISTS intro_text TEXT,
ADD COLUMN IF NOT EXISTS time_estimate VARCHAR(50),
ADD COLUMN IF NOT EXISTS calendly_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN help_page_settings.intro_text IS 'Clear intro framing text shown below the page title';
COMMENT ON COLUMN help_page_settings.time_estimate IS 'Estimated time for the conversation (e.g., "3-5 minutes")';
COMMENT ON COLUMN help_page_settings.calendly_url IS 'Calendly URL for scheduling calls after qualification';
