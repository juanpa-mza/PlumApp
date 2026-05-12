'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { ELENCOS } from '@/lib/supabase'
import { Instagram, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const CONFETTI_COLORS = ['#FF6B00', '#FFB347', '#FF3D00', '#FFD600', '#C2185B', '#43A047', '#fff']

export default function GraciasPage() {
  const params = useSearchParams()
  const elencoId = params.get('elenco')
  const elenco = ELENCOS.find(e => e.id === elencoId)
  const [showConfetti, setShowConfetti] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => setShowConfetti(true), 200)
  }, [])

  return (
    <main className="plum-bg juice-texture min-h-dvh flex flex-col items-center justify-between relative overflow-hidden">
      {/* BG blobs */}
      <div className="blob absolute top-[-60px] right-[-40px] w-56 h-56 bg-orange-400 pointer-events-none" />
      <div className="blob absolute bottom-[-40px] left-[-60px] w-72 h-72 bg-pink-400 pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Confetti */}
      {showConfetti && (
        <div ref={canvasRef} className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 30}%`,
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                animationDelay: `${Math.random() * 0.8}s`,
                animationDuration: `${0.8 + Math.random() * 0.8}s`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}

      {/* Back link */}
      <div className="w-full px-4 pt-6 z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-orange-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      {/* Main card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-8">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center border border-orange-100">
          {/* Emoji big */}
          <div className="text-7xl mb-5 animate-float inline-block">
            {elenco?.emoji || '🎭'}
          </div>

          {/* Stars decoration */}
          <div className="flex justify-center gap-1 mb-4">
            {[0,1,2,3,4].map(i => (
              <Star
                key={i}
                className="w-5 h-5 fill-yellow-400 text-yellow-400"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          <h1 className="font-display text-5xl text-orange-600 leading-none mb-2">
            ¡Gracias<br />por votar!
          </h1>

          {elenco && (
            <p className="mt-3 text-stone-500 text-base font-medium">
              Votaste por
              <span
                className="ml-1 font-bold text-stone-800"
                style={{ color: elenco.color }}
              >
                {elenco.nombre}
              </span>
            </p>
          )}

          <p className="mt-2 text-stone-400 text-sm">
            Tu voto fue registrado con éxito 🎉
          </p>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-orange-100" />
            <span className="text-orange-300 text-xs">seguinos</span>
            <div className="flex-1 h-px bg-orange-100" />
          </div>

          {/* Instagram CTA */}
          <a
            href="https://instagram.com/jugosplum"
            target="_blank"
            rel="noopener noreferrer"
            className="vote-btn flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)' }}
          >
            <Instagram className="w-5 h-5" />
            Seguí a Plum en Instagram
            <span className="text-white/70 text-sm font-normal">@jugosplum</span>
          </a>

          {/* Plum branding */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-stone-300">
            <span>Auspicia</span>
            <span className="font-bold text-orange-400">Jugos Plum 🍊</span>
          </div>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="safe-bottom h-6" />
    </main>
  )
}
