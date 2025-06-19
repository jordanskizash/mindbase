# Supabase Configuration for Development

To disable email confirmation for easier development testing:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `cpuspjxxsfpkxugoplhx`
3. Navigate to **Authentication** → **Settings**
4. Under **User Management**:
   - Turn OFF "Enable email confirmations"
   - Turn ON "Enable manual linking" (optional)
5. Click **Save**

Alternatively, you can keep email confirmation enabled and use the email confirmation flow that's now implemented.

## Database Setup

The following tables should be automatically created by Supabase Auth:
- `auth.users` - User authentication data
- `auth.sessions` - User sessions

User metadata (like name) is stored in the `auth.users` table in the `user_metadata` JSONB column.