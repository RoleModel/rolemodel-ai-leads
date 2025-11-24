-- Add page_description field to help_page_settings table
ALTER TABLE help_page_settings
ADD COLUMN page_description TEXT DEFAULT 'Get personalized answers about your project in minutes. Quick, conversational, and built for busy founders.';
