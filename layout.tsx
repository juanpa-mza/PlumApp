import type { Metadata } from 'next'
import { Nunito, Bebas_Neue } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Liga Mendocina de Improvisación | Votá tu elenco',
  description: 'Votá por tu elenco favorito en el evento de improvisación teatral. Auspicia Jugos Plum.',
  openGraph: {
    title: 'Liga Mendocina de Improvisación',
    description: '¡Votá por tu elenco favorito!',
    type: 'website',
  },
  themeColor: '#FF6B00',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${nunito.variable} ${bebasNeue.variable}`}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  )
}
