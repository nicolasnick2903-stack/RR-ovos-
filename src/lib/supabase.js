import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Quando as duas variáveis estão preenchidas, o app usa o Supabase (auth real +
// persistência). Sem elas, cai no modo local (localStorage).
export const supabaseAtivo = Boolean(url && key)

export const supabase = supabaseAtivo
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
