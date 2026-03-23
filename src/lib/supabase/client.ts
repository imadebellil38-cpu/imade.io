import { createBrowserClient } from '@supabase/ssr'
import { createDemoClient } from '@/lib/demo/client'
import { isDemoMode } from '@/lib/demo/data'

export function createClient() {
  if (isDemoMode()) {
    return createDemoClient() as any
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
