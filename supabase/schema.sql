


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."match_sources"("chatbot_id" "uuid", "query_embedding" "public"."vector", "match_threshold" double precision DEFAULT 0.5, "match_count" integer DEFAULT 5) RETURNS TABLE("id" "uuid", "title" "text", "content" "text", "similarity" double precision)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    sources.id,
    sources.title,
    sources.content,
    1 - (sources.embedding <=> query_embedding) AS similarity
  FROM sources
  WHERE sources.chatbot_id = match_sources.chatbot_id
    AND sources.embedding IS NOT NULL
    AND 1 - (sources.embedding <=> query_embedding) > match_threshold
  ORDER BY sources.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


ALTER FUNCTION "public"."match_sources"("chatbot_id" "uuid", "query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ab_test_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ab_test_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_conversation_on_message"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE conversations
  SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_conversation_on_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ab_test_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "variant_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "session_id" "text",
    "visitor_id" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ab_test_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['view'::"text", 'engagement'::"text", 'conversion'::"text", 'bounce'::"text"])))
);


ALTER TABLE "public"."ab_test_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ab_test_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "test_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "path" "text" NOT NULL,
    "weight" integer DEFAULT 50 NOT NULL,
    "is_control" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ab_test_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ab_tests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ab_tests_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'paused'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."ab_tests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chatbot_id" "uuid",
    "conversation_id" "uuid",
    "event_type" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chatbots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "instructions" "text",
    "business_context" "text",
    "model" "text" DEFAULT 'gpt-4o-mini'::"text",
    "temperature" numeric DEFAULT 0.7,
    "display_name" "text",
    "initial_message" "text" DEFAULT 'Hi! What can I help you with?'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chatbots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chatbot_id" "uuid",
    "visitor_id" "text",
    "visitor_email" "text",
    "visitor_name" "text",
    "visitor_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "last_message_at" timestamp with time zone DEFAULT "now"(),
    "message_count" integer DEFAULT 0,
    "lead_captured" boolean DEFAULT false,
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    "email_sent_at" timestamp with time zone
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."conversations"."is_archived" IS 'Soft delete flag - archived conversations are hidden from default views';



COMMENT ON COLUMN "public"."conversations"."archived_at" IS 'Timestamp when the conversation was archived';



CREATE TABLE IF NOT EXISTS "public"."help_page_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chatbot_id" "uuid",
    "page_title" "text" DEFAULT 'Help page'::"text",
    "favicon" "text",
    "logo" "text",
    "enable_theme_switch" boolean DEFAULT true,
    "default_theme" "text" DEFAULT 'light'::"text",
    "light_primary_color" "text" DEFAULT '#000000'::"text",
    "dark_primary_color" "text" DEFAULT '#FFFFFF'::"text",
    "ai_instructions" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "page_description" "text" DEFAULT 'Get personalized answers about your project in minutes. Quick, conversational, and built for busy founders.'::"text",
    "intro_text" "text",
    "time_estimate" character varying(50),
    "calendly_url" "text",
    "rag_config" "jsonb" DEFAULT '{"askForName": true, "enableBANT": true, "askForEmail": true, "sourceLimit": 5, "maxQuestions": 5, "citationStyle": "numbered", "enableCitations": true, "enableCaseStudies": true, "customInstructions": "", "responseConciseness": "moderate", "similarityThreshold": 0.5, "enablePersonalization": true}'::"jsonb",
    CONSTRAINT "help_page_settings_default_theme_check" CHECK (("default_theme" = ANY (ARRAY['light'::"text", 'dark'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."help_page_settings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."help_page_settings"."intro_text" IS 'Clear intro framing text shown below the page title';



COMMENT ON COLUMN "public"."help_page_settings"."time_estimate" IS 'Estimated time for the conversation (e.g., "3-5 minutes")';



COMMENT ON COLUMN "public"."help_page_settings"."calendly_url" IS 'Calendly URL for scheduling calls after qualification';



COMMENT ON COLUMN "public"."help_page_settings"."rag_config" IS 'RAG configuration: {sourceLimit: number, similarityThreshold: number, enableCitations: boolean, enableCaseStudies: boolean, citationStyle: string, enableBANT: boolean, askForName: boolean, askForEmail: boolean, maxQuestions: number, responseConciseness: string, enablePersonalization: boolean, customInstructions: string}';



CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid",
    "visitor_name" "text",
    "visitor_email" "text",
    "summary" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


COMMENT ON COLUMN "public"."leads"."is_archived" IS 'Soft delete flag - archived leads are hidden from default views';



COMMENT ON COLUMN "public"."leads"."archived_at" IS 'Timestamp when the lead was archived';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid",
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "sources_used" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chatbot_id" "uuid",
    "title" "text",
    "content" "text" NOT NULL,
    "embedding" "public"."vector"(1536),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."widget_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chatbot_id" "uuid",
    "config" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."widget_configs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ab_test_events"
    ADD CONSTRAINT "ab_test_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ab_test_variants"
    ADD CONSTRAINT "ab_test_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ab_test_variants"
    ADD CONSTRAINT "ab_test_variants_test_id_path_key" UNIQUE ("test_id", "path");



ALTER TABLE ONLY "public"."ab_tests"
    ADD CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chatbots"
    ADD CONSTRAINT "chatbots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."help_page_settings"
    ADD CONSTRAINT "help_page_settings_chatbot_id_key" UNIQUE ("chatbot_id");



ALTER TABLE ONLY "public"."help_page_settings"
    ADD CONSTRAINT "help_page_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sources"
    ADD CONSTRAINT "sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."widget_configs"
    ADD CONSTRAINT "widget_configs_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_ab_test_events_created_at" ON "public"."ab_test_events" USING "btree" ("created_at");



CREATE INDEX "idx_ab_test_events_event_type" ON "public"."ab_test_events" USING "btree" ("event_type");



CREATE INDEX "idx_ab_test_events_variant_id" ON "public"."ab_test_events" USING "btree" ("variant_id");



CREATE INDEX "idx_ab_test_variants_test_id" ON "public"."ab_test_variants" USING "btree" ("test_id");



CREATE INDEX "idx_ab_tests_status" ON "public"."ab_tests" USING "btree" ("status");



CREATE INDEX "idx_analytics_chatbot" ON "public"."analytics_events" USING "btree" ("chatbot_id");



CREATE INDEX "idx_analytics_created" ON "public"."analytics_events" USING "btree" ("created_at");



CREATE INDEX "idx_conversations_chatbot" ON "public"."conversations" USING "btree" ("chatbot_id");



CREATE INDEX "idx_conversations_is_archived" ON "public"."conversations" USING "btree" ("is_archived");



CREATE INDEX "idx_leads_conversation" ON "public"."leads" USING "btree" ("conversation_id");



CREATE INDEX "idx_leads_created" ON "public"."leads" USING "btree" ("created_at");



CREATE INDEX "idx_leads_email" ON "public"."leads" USING "btree" ("visitor_email");



CREATE INDEX "idx_leads_is_archived" ON "public"."leads" USING "btree" ("is_archived");



CREATE INDEX "idx_messages_conversation" ON "public"."messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_sources_chatbot" ON "public"."sources" USING "btree" ("chatbot_id");



CREATE UNIQUE INDEX "idx_widget_configs_chatbot" ON "public"."widget_configs" USING "btree" ("chatbot_id");



CREATE INDEX "sources_embedding_idx" ON "public"."sources" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE OR REPLACE TRIGGER "trigger_ab_tests_updated_at" BEFORE UPDATE ON "public"."ab_tests" FOR EACH ROW EXECUTE FUNCTION "public"."update_ab_test_updated_at"();



CREATE OR REPLACE TRIGGER "update_chatbots_updated_at" BEFORE UPDATE ON "public"."chatbots" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_conversation_stats" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_conversation_on_message"();



CREATE OR REPLACE TRIGGER "update_help_page_settings_updated_at" BEFORE UPDATE ON "public"."help_page_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_widget_configs_updated_at" BEFORE UPDATE ON "public"."widget_configs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."ab_test_events"
    ADD CONSTRAINT "ab_test_events_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."ab_test_variants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ab_test_variants"
    ADD CONSTRAINT "ab_test_variants_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "public"."ab_tests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."help_page_settings"
    ADD CONSTRAINT "help_page_settings_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sources"
    ADD CONSTRAINT "sources_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."widget_configs"
    ADD CONSTRAINT "widget_configs_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "public"."chatbots"("id") ON DELETE CASCADE;



CREATE POLICY "Allow public insert ab_test_events" ON "public"."ab_test_events" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public read ab_test_events" ON "public"."ab_test_events" FOR SELECT USING (true);



CREATE POLICY "Allow public read ab_test_variants" ON "public"."ab_test_variants" FOR SELECT USING (true);



CREATE POLICY "Allow public read ab_tests" ON "public"."ab_tests" FOR SELECT USING (true);



ALTER TABLE "public"."ab_test_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ab_test_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ab_tests" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."match_sources"("chatbot_id" "uuid", "query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."match_sources"("chatbot_id" "uuid", "query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_sources"("chatbot_id" "uuid", "query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ab_test_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ab_test_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ab_test_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_conversation_on_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_conversation_on_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_conversation_on_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."ab_test_events" TO "anon";
GRANT ALL ON TABLE "public"."ab_test_events" TO "authenticated";
GRANT ALL ON TABLE "public"."ab_test_events" TO "service_role";



GRANT ALL ON TABLE "public"."ab_test_variants" TO "anon";
GRANT ALL ON TABLE "public"."ab_test_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."ab_test_variants" TO "service_role";



GRANT ALL ON TABLE "public"."ab_tests" TO "anon";
GRANT ALL ON TABLE "public"."ab_tests" TO "authenticated";
GRANT ALL ON TABLE "public"."ab_tests" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON TABLE "public"."chatbots" TO "anon";
GRANT ALL ON TABLE "public"."chatbots" TO "authenticated";
GRANT ALL ON TABLE "public"."chatbots" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."help_page_settings" TO "anon";
GRANT ALL ON TABLE "public"."help_page_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."help_page_settings" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."sources" TO "anon";
GRANT ALL ON TABLE "public"."sources" TO "authenticated";
GRANT ALL ON TABLE "public"."sources" TO "service_role";



GRANT ALL ON TABLE "public"."widget_configs" TO "anon";
GRANT ALL ON TABLE "public"."widget_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."widget_configs" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







