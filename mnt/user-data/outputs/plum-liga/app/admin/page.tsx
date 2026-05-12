'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, ELENCOS, type Evento, type Voto } from '@/lib/supabase'
import {
  Lock, BarChart2, RefreshCw, Plus, StopCircle,
  Download, Users, Trophy, Calendar, Zap, LogOut, Eye, EyeOff
} from 'lucide-react'

type VotoCount = { elenco: string; count: number; porcentaje: number }

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Admin state
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoActivo, setEventoActivo] = useState<Evento | null>(null)
  const [votos, setVotos] = useState<VotoCount[]>([])
  const [totalVotos, setTotalVotos] = useState(0)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [creando, setCreando] = useState(false)
  const [accionLoading, setAccionLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'plum2024admin')) {
      setAutenticado(true)
      sessionStorage.setItem('plum_admin', '1')
    } else {
      setError('Contraseña incorrecta')
      setTimeout(() => setError(''), 2000)
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('plum_admin') === '1') {
      setAutenticado(true)
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    // Fetch eventos
    const { data: eventosData } = await supabase
      .from('eventos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (eventosData) {
      setEventos(eventosData)
      const activo = eventosData.find(e => e.activa)
      setEventoActivo(activo || null)

      if (activo) {
        // Fetch votos del evento activo
        const { data: votosData } = await supabase
          .from('votos')
          .select('elenco')
          .eq('evento_id', activo.id)

        if (votosData) {
          const total = votosData.length
          setTotalVotos(total)
          const counts: Record<string, number> = {}
          votosData.forEach(v => { counts[v.elenco] = (counts[v.elenco] || 0) + 1 })
          const result: VotoCount[] = ELENCOS.map(e => ({
            elenco: e.id,
            count: counts[e.id] || 0,
            porcentaje: total > 0 ? Math.round(((counts[e.id] || 0) / total) * 100) : 0,
          }))
          setVotos(result.sort((a, b) => b.count - a.count))
        }
      } else {
        setVotos([])
        setTotalVotos(0)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (autenticado) {
      fetchData()
      // Real-time subscription
      const channel = supabase
        .channel('votos-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votos' }, () => {
          fetchData()
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [autenticado, fetchData])

  const crearEvento = async () => {
    if (!nuevoNombre.trim()) return
    setCreando(true)
    // Desactivar evento activo anterior
    if (eventoActivo) {
      await supabase.from('eventos').update({ activa: false }).eq('id', eventoActivo.id)
    }
    await supabase.from('eventos').insert({
      nombre: nuevoNombre.trim(),
      activa: true,
    })
    setNuevoNombre('')
    setCreando(false)
    fetchData()
  }

  const cerrarVotacion = async () => {
    if (!eventoActivo) return
    setAccionLoading(true)
    await supabase.from('eventos').update({ activa: false }).eq('id', eventoActivo.id)
    setAccionLoading(false)
    fetchData()
  }

  const reiniciarVotacion = async () => {
    if (!eventoActivo || !confirm('¿Borrar todos los votos del evento actual?')) return
    setAccionLoading(true)
    await supabase.from('votos').delete().eq('evento_id', eventoActivo.id)
    setAccionLoading(false)
    fetchData()
  }

  const exportarCSV = async () => {
    if (!eventoActivo) return
    const { data } = await supabase
      .from('votos')
      .select('*')
      .eq('evento_id', eventoActivo.id)
      .order('fecha', { ascending: true })

    if (!data) return
    const rows = [
      ['ID', 'Evento', 'Elenco', 'Fecha', 'Device ID'],
      ...data.map(v => [v.id, eventoActivo.nombre, v.elenco, v.fecha, v.device_id])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `votos-${eventoActivo.nombre}-${Date.now()}.csv`
    a.click()
  }

  if (!autenticado) {
    return <LoginPanel password={password} setPassword={setPassword} showPass={showPass} setShowPass={setShowPass} error={error} onSubmit={handleLogin} />
  }

  const top = votos[0]

  return (
    <main className="min-h-dvh bg-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-stone-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-orange-400 leading-none">Panel Admin</h1>
          <p className="text-stone-500 text-xs">Liga Mendocina de Improvisación</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { sessionStorage.removeItem('plum_admin'); setAutenticado(false) }}
            className="p-2 rounded-xl bg-stone-800 hover:bg-red-900 text-stone-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4 max-w-2xl mx-auto pb-24">

        {/* Status card */}
        <div className={`rounded-2xl p-4 ${eventoActivo ? 'bg-green-950 border border-green-800' : 'bg-stone-900 border border-stone-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${eventoActivo ? 'bg-green-400 animate-pulse' : 'bg-stone-600'}`} />
              <span className="text-sm font-semibold">
                {eventoActivo ? 'Votación activa' : 'Sin evento activo'}
              </span>
            </div>
            {eventoActivo && (
              <span className="text-xs text-stone-400 bg-stone-800 rounded-lg px-2 py-1">
                {eventoActivo.nombre}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Users className="w-4 h-4" />} label="Total votos" value={totalVotos} color="orange" />
          <StatCard icon={<Trophy className="w-4 h-4" />} label="Puntero" value={top ? ELENCOS.find(e=>e.id===top.elenco)?.nombre?.split(' ')[1] || '-' : '-'} color="yellow" />
          <StatCard icon={<BarChart2 className="w-4 h-4" />} label="Elencos" value={ELENCOS.length} color="green" />
        </div>

        {/* Live results */}
        {eventoActivo && (
          <section className="bg-stone-900 rounded-2xl p-4 border border-stone-800">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-400" />
              <h2 className="text-sm font-bold text-stone-200">Resultados en vivo</h2>
              <span className="ml-auto text-xs text-stone-500">{totalVotos} votos</span>
            </div>
            <div className="space-y-3">
              {ELENCOS.map((elenco, idx) => {
                const voto = votos.find(v => v.elenco === elenco.id) || { count: 0, porcentaje: 0 }
                const isTop = votos[0]?.elenco === elenco.id && voto.count > 0
                return (
                  <div key={elenco.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{elenco.emoji}</span>
                        <span className="text-sm font-semibold text-stone-200">{elenco.nombre}</span>
                        {isTop && <span className="text-xs bg-yellow-400/20 text-yellow-400 rounded-full px-2 py-0.5">👑 Puntero</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold" style={{ color: elenco.color }}>{voto.porcentaje}%</span>
                        <span className="text-xs text-stone-500 ml-1">({voto.count})</span>
                      </div>
                    </div>
                    <div className="h-3 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full progress-bar"
                        style={{
                          width: `${voto.porcentaje}%`,
                          background: `linear-gradient(90deg, ${elenco.color}88, ${elenco.color})`,
                          minWidth: voto.count > 0 ? '8px' : '0',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="bg-stone-900 rounded-2xl p-4 border border-stone-800 space-y-3">
          <h2 className="text-sm font-bold text-stone-300 mb-3">Acciones</h2>

          {/* Crear evento */}
          <div className="flex gap-2">
            <input
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              placeholder="Nombre del nuevo evento"
              className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
              onKeyDown={e => e.key === 'Enter' && crearEvento()}
            />
            <button
              onClick={crearEvento}
              disabled={creando || !nuevoNombre.trim()}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 text-white rounded-xl px-3 py-2.5 text-sm font-bold transition-colors whitespace-nowrap"
            >
              {creando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear
            </button>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <ActionBtn
              icon={<StopCircle className="w-4 h-4" />}
              label="Cerrar"
              disabled={!eventoActivo || accionLoading}
              onClick={cerrarVotacion}
              color="red"
            />
            <ActionBtn
              icon={<RefreshCw className="w-4 h-4" />}
              label="Reiniciar"
              disabled={!eventoActivo || accionLoading}
              onClick={reiniciarVotacion}
              color="yellow"
            />
            <ActionBtn
              icon={<Download className="w-4 h-4" />}
              label="CSV"
              disabled={!eventoActivo || totalVotos === 0}
              onClick={exportarCSV}
              color="green"
            />
          </div>
        </section>

        {/* Historial */}
        {eventos.length > 0 && (
          <section className="bg-stone-900 rounded-2xl p-4 border border-stone-800">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-stone-400" />
              <h2 className="text-sm font-bold text-stone-300">Historial de eventos</h2>
            </div>
            <div className="space-y-2">
              {eventos.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-stone-800 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${e.activa ? 'bg-green-400' : 'bg-stone-600'}`} />
                    <span className="text-sm text-stone-300 font-medium">{e.nombre}</span>
                  </div>
                  <span className="text-xs text-stone-600">
                    {new Date(e.created_at).toLocaleDateString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* QR info */}
        <section className="bg-stone-900 rounded-2xl p-4 border border-stone-800">
          <h2 className="text-sm font-bold text-stone-300 mb-2 flex items-center gap-2">
            <span>📱</span> URL para QR
          </h2>
          <div className="bg-stone-800 rounded-xl px-3 py-2 text-xs text-orange-400 font-mono break-all select-all">
            {typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.vercel.app'}
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Generá el QR en <strong className="text-stone-400">qr.io</strong> o <strong className="text-stone-400">qr-code-generator.com</strong> con esta URL
          </p>
        </section>
      </div>
    </main>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number | string; color: 'orange' | 'yellow' | 'green'
}) {
  const colors = {
    orange: 'text-orange-400 bg-orange-950 border-orange-900',
    yellow: 'text-yellow-400 bg-yellow-950 border-yellow-900',
    green: 'text-green-400 bg-green-950 border-green-900',
  }
  return (
    <div className={`${colors[color]} border rounded-2xl p-3 text-center`}>
      <div className="flex justify-center mb-1 opacity-70">{icon}</div>
      <div className="text-2xl font-display">{value}</div>
      <div className="text-xs opacity-60 mt-0.5">{label}</div>
    </div>
  )
}

function ActionBtn({ icon, label, disabled, onClick, color }: {
  icon: React.ReactNode; label: string; disabled: boolean; onClick: () => void; color: 'red' | 'yellow' | 'green'
}) {
  const colors = {
    red: 'bg-red-900/50 hover:bg-red-800 text-red-400 border-red-900',
    yellow: 'bg-yellow-900/50 hover:bg-yellow-800 text-yellow-400 border-yellow-900',
    green: 'bg-green-900/50 hover:bg-green-800 text-green-400 border-green-900',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colors[color]} border flex flex-col items-center gap-1 rounded-xl p-3 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
    >
      {icon}
      {label}
    </button>
  )
}

function LoginPanel({ password, setPassword, showPass, setShowPass, error, onSubmit }: {
  password: string
  setPassword: (v: string) => void
  showPass: boolean
  setShowPass: (v: boolean) => void
  error: string
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <main className="min-h-dvh bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="font-display text-3xl text-orange-400">Panel Admin</h1>
          <p className="text-stone-500 text-sm mt-1">Liga Mendocina de Improvisación</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full bg-stone-900 border border-stone-700 rounded-2xl pl-10 pr-10 py-3.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 transition-colors"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center animate-pop">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-2xl transition-colors"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-stone-700 text-xs mt-8">
          Jugos Plum — Liga Mendocina de Improvisación
        </p>
      </div>
    </main>
  )
}
