-- A/B Testing Tables for Intro Pages
-- Migration: 007_create_ab_testing_tables.sql

-- Table for A/B test definitions
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for test variants
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL, -- e.g., '/intro/a' or '/intro/b'
  weight INTEGER NOT NULL DEFAULT 50, -- Traffic allocation percentage
  is_control BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(test_id, path)
);

-- Table for tracking events (views, conversions, etc.)
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES ab_test_variants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'engagement', 'conversion', 'bounce')),
  session_id TEXT, -- Anonymous session tracking
  visitor_id TEXT, -- For returning visitor tracking
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ab_test_events_variant_id ON ab_test_events(variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_created_at ON ab_test_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_event_type ON ab_test_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_test_id ON ab_test_variants(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ab_test_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_ab_tests_updated_at ON ab_tests;
CREATE TRIGGER trigger_ab_tests_updated_at
  BEFORE UPDATE ON ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_ab_test_updated_at();

-- Insert default intro pages A/B test
INSERT INTO ab_tests (name, description, status)
VALUES ('Intro Page Test', 'A/B test between intro page variants A and B', 'active')
ON CONFLICT DO NOTHING;

-- Insert variants for the default test (will need to get the test_id)
DO $$
DECLARE
  test_uuid UUID;
BEGIN
  SELECT id INTO test_uuid FROM ab_tests WHERE name = 'Intro Page Test' LIMIT 1;

  IF test_uuid IS NOT NULL THEN
    INSERT INTO ab_test_variants (test_id, name, path, weight, is_control)
    VALUES
      (test_uuid, 'Variant A (Control)', '/intro/a', 50, TRUE),
      (test_uuid, 'Variant B', '/intro/b', 50, FALSE)
    ON CONFLICT (test_id, path) DO NOTHING;
  END IF;
END $$;

-- RLS Policies (if needed)
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;

-- Allow public read for tests (needed for variant assignment)
CREATE POLICY "Allow public read ab_tests" ON ab_tests
  FOR SELECT USING (true);

CREATE POLICY "Allow public read ab_test_variants" ON ab_test_variants
  FOR SELECT USING (true);

-- Allow public insert for events (anonymous tracking)
CREATE POLICY "Allow public insert ab_test_events" ON ab_test_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read ab_test_events" ON ab_test_events
  FOR SELECT USING (true);
