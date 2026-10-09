import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function serverClient() {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { fetch: (url: RequestInfo | URL, options: RequestInit = {}) => fetch(url, { ...options, signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) }) },
    cookies: { getAll: () => jar.getAll(), setAll: (values: { name: string; value: string; options: CookieOptions }[]) => values.forEach(({name, value, options}) => jar.set(name, value, options)) },
  });
}
export async function authenticatedClient() {
  const supabase = await serverClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
}
