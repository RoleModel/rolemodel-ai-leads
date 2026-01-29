-- Add tool_invocations column to store tool call data for message reconstruction
ALTER TABLE "public"."messages" 
ADD COLUMN IF NOT EXISTS "tool_invocations" "jsonb" DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN "public"."messages"."tool_invocations" IS 'Stores tool invocation data (toolName, input, output) for reconstructing message parts';
