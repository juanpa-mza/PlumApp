'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, ELENCOS, type Evento } from '@/lib/supabase'
import { getDeviceId, saveVoteLocally, getLocalVote } from '@/lib/device'
import { Instagram, Star, Zap, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(true)
  const [votando, setVotando] = useState<string | null>(null)
  const [yaVoto, setYaVoto] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = getDeviceId()
    setDeviceId(id)
  }, [])

  const fetchEvento = useCallback(async () => {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('activa', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!error && data) {
      setEvento(data)
      const votoLocal = getLocalVote(data.id)
      setYaVoto(votoLocal)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvento()
  }, [fetchEvento])

  const handleVotar = async (elencoId: string) => {
    if (!evento || votando || yaVoto || !deviceId) return

    setVotando(elencoId)

    // Check si ya votó en la DB
    const { data: existente } = await supabase
      .from('votos')
      .select('id')
      .eq('evento_id', evento.id)
      .eq('device_id', deviceId)
      .single()

    if (existente) {
      saveVoteLocally(evento.id, elencoId)
      setYaVoto(elencoId)
      setVotando(null)
      return
    }

    // Insertar voto
    const { error } = await supabase.from('votos').insert({
      evento_id: evento.id,
      elenco: elencoId,
      device_id: deviceId,
    })

    if (!error) {
      saveVoteLocally(evento.id, elencoId)
      router.push(`/gracias?elenco=${elencoId}`)
    } else {
      setVotando(null)
    }
  }

  if (!mounted || loading) {
    return <LoadingSkeleton />
  }

  return (
    <main className="plum-bg juice-texture min-h-dvh flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob absolute top-[-80px] right-[-60px] w-64 h-64 bg-orange-400 pointer-events-none" />
      <div className="blob absolute bottom-[20%] left-[-80px] w-80 h-80 bg-yellow-400 pointer-events-none" style={{ animationDelay: '3s' }} />

      {/* Header */}
      <header className="relative z-10 pt-10 pb-6 px-5 text-center">
        {/* Plum logo area */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-orange-200 rounded-full px-4 py-1.5 text-xs font-semibold text-orange-600 uppercase tracking-widest shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Votación en vivo
          </div>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl text-orange-600 leading-none mb-2 drop-shadow-sm">
          Liga Mendocina
        </h1>
        <h2 className="font-display text-3xl sm:text-4xl text-orange-400 leading-none mb-5">
          de Improvisación
        </h2>

        <p className="text-lg text-stone-600 font-semibold max-w-xs mx-auto leading-snug">
          Elegí el elenco que más<br />te gustó esta noche 🎭
        </p>

        {evento && (
          <div className="mt-4 inline-block bg-white/60 rounded-xl px-4 py-2 text-sm text-stone-500 font-medium">
            🎪 {evento.nombre}
          </div>
        )}
      </header>

      {/* Main content */}
      <section className="flex-1 px-4 pb-4 relative z-10">
        {!evento ? (
          <NoEventoBanner />
        ) : yaVoto ? (
          <YaVotoBanner elenco={yaVoto} />
        ) : (
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {ELENCOS.map((elenco, index) => (
              <ElencoCard
                key={elenco.id}
                elenco={elenco}
                index={index}
                isVotando={votando === elenco.id}
                disabled={!!votando}
                onVotar={() => handleVotar(elenco.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 text-center safe-bottom">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
            <Heart className="w-3 h-3 text-orange-400" />
            <span>Auspicia</span>
            <span className="font-bold text-orange-500">Jugos Plum</span>
            <Heart className="w-3 h-3 text-orange-400" />
          </div>
          <a
            href="https://instagram.com/jugosplum"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full px-5 py-2.5 text-sm font-bold shadow-lg shadow-orange-200 active:scale-95 transition-transform"
          >
            <Instagram className="w-4 h-4" />
            @jugosplum
          </a>
        </div>
      </footer>
    </main>
  )
}

function ElencoCard({ elenco, index, isVotando, disabled, onVotar }: {
  elenco: typeof ELENCOS[0]
  index: number
  isVotando: boolean
  disabled: boolean
  onVotar: () => void
}) {
  return (
    <div
      className="card-lift bg-white rounded-3xl overflow-hidden shadow-md border border-orange-100"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Color top band */}
      <div className={`bg-gradient-to-br ${elenco.colorBg} h-28 flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 shimmer" />
        <span className="text-5xl relative z-10 animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
          {elenco.emoji}
        </span>
      </div>

      {/* Card body */}
      <div className="p-3 text-center">
        <h3 className="font-display text-2xl text-stone-800 mb-2">{elenco.nombre}</h3>
        <button
          onClick={onVotar}
          disabled={disabled}
          className="vote-btn w-full py-2.5 rounded-2xl font-bold text-white text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${elenco.color}, ${elenco.color}cc)` }}
        >
          {isVotando ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Votando…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5" />
              Votar
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

function YaVotoBanner({ elenco }: { elenco: string }) {
  const e = ELENCOS.find(el => el.id === elenco)
  return (
    <div className="max-w-md mx-auto mt-4">
      <div className="bg-white rounded-3xl p-8 text-center shadow-xl border border-orange-100">
        <div className="text-6xl mb-4 animate-float">{e?.emoji || '🎭'}</div>
        <div className="font-display text-3xl text-orange-600 mb-2">¡Ya votaste!</div>
        <p className="text-stone-500 text-sm">
          Tu voto por <strong className="text-stone-700">{e?.nombre}</strong> ya fue registrado.<br />
          ¡Gracias por participar!
        </p>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-stone-400">
          <Zap className="w-3 h-3" />
          Solo se permite un voto por dispositivo
        </div>
      </div>
    </div>
  )
}

function NoEventoBanner() {
  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white/80 rounded-3xl p-8 text-center shadow-lg border border-orange-100">
        <div className="text-5xl mb-4">🌙</div>
        <div className="font-display text-3xl text-stone-500 mb-2">Sin evento activo</div>
        <p className="text-stone-400 text-sm">
          La votación aún no comenzó.<br />¡Esperá que el organizador la active!
        </p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <main className="plum-bg juice-texture min-h-dvh flex flex-col">
      <div className="pt-10 pb-6 px-5 text-center">
        <div className="h-12 bg-orange-200/50 rounded-2xl w-3/4 mx-auto mb-3 animate-pulse" />
        <div className="h-8 bg-orange-100/50 rounded-xl w-1/2 mx-auto mb-5 animate-pulse" />
        <div className="h-5 bg-stone-100 rounded-lg w-2/3 mx-auto animate-pulse" />
      </div>
      <div className="px-4 grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-white/50 rounded-3xl h-52 animate-pulse" />
        ))}
      </div>
    </main>
  )
}
