#!/usr/bin/env node

/**
 * Script to create an admin user in Supabase
 *
 * Usage:
 *   node scripts/create-admin-user.js email@example.com password123
 *
 * Or with environment variables:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secure123 node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv/config')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser(email, password) {
  console.log(`📧 Creating admin user: ${email}`)

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
  })

  if (error) {
    console.error('❌ Error creating user:', error.message)
    process.exit(1)
  }

  console.log('✅ Admin user created successfully!')
  console.log(`   User ID: ${data.user.id}`)
  console.log(`   Email: ${data.user.email}`)
  console.log('\n🔐 You can now log in at /login with these credentials.')
}

// Get credentials from command line or environment variables
const email = process.argv[2] || process.env.ADMIN_EMAIL
const password = process.argv[3] || process.env.ADMIN_PASSWORD

if (!email || !password) {
  console.error('❌ Usage: node scripts/create-admin-user.js <email> <password>')
  console.error('   Or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables')
  process.exit(1)
}

createAdminUser(email, password)
