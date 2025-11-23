-- Help page settings table
CREATE TABLE help_page_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  page_title TEXT DEFAULT 'Help page',
  favicon TEXT,
  logo TEXT,
  enable_theme_switch BOOLEAN DEFAULT TRUE,
  default_theme TEXT DEFAULT 'light' CHECK (default_theme IN ('light', 'dark', 'system')),
  light_primary_color TEXT DEFAULT '#000000',
  dark_primary_color TEXT DEFAULT '#FFFFFF',
  ai_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chatbot_id)
);

-- Trigger for help_page_settings updated_at
CREATE TRIGGER update_help_page_settings_updated_at
  BEFORE UPDATE ON help_page_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings for RoleModel chatbot
INSERT INTO help_page_settings (chatbot_id)
VALUES ('a0000000-0000-0000-0000-000000000001'::uuid);
