import { afterEach, vi } from 'vitest'

// Mock environment variables for testing
// These prevent undefined errors during module initialization
// Real API calls should be mocked separately in individual tests
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
vi.stubEnv('AI_GATEWAY_API_KEY', 'test-gateway-key')

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})


