-- Drop webhooks functionality

-- Drop policies first
DROP POLICY IF EXISTS "Service role can manage webhook deliveries" ON webhook_deliveries;
DROP POLICY IF EXISTS "Service role can manage webhooks" ON webhooks;

-- Drop function
DROP FUNCTION IF EXISTS increment_webhook_failure(UUID);

-- Drop indexes
DROP INDEX IF EXISTS idx_webhook_deliveries_created_at;
DROP INDEX IF EXISTS idx_webhook_deliveries_webhook_id;
DROP INDEX IF EXISTS idx_webhooks_is_active;
DROP INDEX IF EXISTS idx_webhooks_chatbot_id;

-- Drop tables (webhook_deliveries first due to foreign key constraint)
DROP TABLE IF EXISTS webhook_deliveries;
DROP TABLE IF EXISTS webhooks;
