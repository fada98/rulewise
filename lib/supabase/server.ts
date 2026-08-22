import { createClient } from "@supabase/supabase-js";
function required(name:string){const value=process.env[name];if(!value)throw new Error(`${name} is not configured.`);return value}
export function createSupabaseServerClient(accessToken?:string){return createClient(required("NEXT_PUBLIC_SUPABASE_URL"),required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),{global:{headers:accessToken?{Authorization:`Bearer ${accessToken}`}:{}} ,auth:{persistSession:false,autoRefreshToken:false}})}
export function createSupabaseAdminClient(){return createClient(required("NEXT_PUBLIC_SUPABASE_URL"),required("SUPABASE_SERVICE_ROLE_KEY"),{auth:{persistSession:false,autoRefreshToken:false}})}
