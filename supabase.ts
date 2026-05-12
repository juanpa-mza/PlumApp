import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type Evento = {
  id: string
  nombre: string
  fecha: string
  activa: boolean
  created_at: string
}

export type Voto = {
  id: string
  evento_id: string
  elenco: string
  fecha: string
  device_id: string
}

export type ElencoConfig = {
  id: string
  nombre: string
  emoji: string
  color: string
  colorBg: string
}

export const ELENCOS: ElencoConfig[] = [
  {
    id: 'elenco_a',
    nombre: 'Elenco A',
    emoji: '🎭',
    color: '#FF6B00',
    colorBg: 'from-orange-400 to-orange-600',
  },
  {
    id: 'elenco_b',
    nombre: 'Elenco B',
    emoji: '⚡',
    color: '#ec407a',
    colorBg: 'from-pink-400 to-pink-600',
  },
  {
    id: 'elenco_c',
    nombre: 'Elenco C',
    emoji: '🌟',
    color: '#FDD835',
    colorBg: 'from-yellow-400 to-yellow-500',
  },
  {
    id: 'elenco_d',
    nombre: 'Elenco D',
    emoji: '🍃',
    color: '#43A047',
    colorBg: 'from-green-400 to-green-600',
  },
]
