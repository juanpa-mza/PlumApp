# 🍊 Plum App de la Liga

**App de votación para la Liga Mendocina de Improvisación**  
Auspicia: Jugos Plum

---

## 📋 Stack Técnico

| Tecnología | Uso |
|-----------|-----|
| **Next.js 14** | Framework React (App Router) |
| **TypeScript** | Tipado estático |
| **Tailwind CSS** | Estilos utility-first |
| **Supabase** | Base de datos PostgreSQL + real-time |
| **Vercel** | Deploy y hosting |

---

## 🚀 Deploy Paso a Paso

### 1. Supabase — Crear base de datos

1. Ir a [supabase.com](https://supabase.com) y crear cuenta gratuita
2. Crear nuevo proyecto (elegir región **South America - São Paulo**)
3. En el panel izquierdo, ir a **SQL Editor**
4. Pegar y ejecutar el contenido de `supabase-schema.sql`
5. Ir a **Project Settings → API** y copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Subir código a GitHub

```bash
# En la carpeta del proyecto:
git init
git add .
git commit -m "Initial commit - Plum Liga App"

# Crear repositorio en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/plum-liga.git
git push -u origin main
```

### 3. Deploy en Vercel

1. Ir a [vercel.com](https://vercel.com) y loguearse con GitHub
2. Click **"Add New Project"**
3. Importar el repositorio `plum-liga`
4. En **"Environment Variables"**, agregar:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://TU_PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = tu_anon_key_aqui
   NEXT_PUBLIC_ADMIN_PASSWORD    = TuPasswordSeguro2024
   NEXT_PUBLIC_APP_URL           = https://tu-app.vercel.app
   ```
5. Click **Deploy** ✅

---

## 🌐 Conectar Dominio Propio

### Opción A — Dominio en Vercel
1. Panel Vercel → tu proyecto → **Domains**
2. Escribir tu dominio: `ligamendocina.com.ar`
3. Seguir instrucciones de DNS

### Opción B — Dominio externo (Namecheap, GoDaddy, NIC Argentina)
En el panel DNS de tu proveedor, agregar:
```
Tipo: CNAME
Host: www (o @)
Valor: cname.vercel-dns.com
TTL: 3600
```

---

## 📱 Generar QR

Una vez deployado, generá el QR con:

### Opción 1 — Online (gratis)
- [qr.io](https://qr.io)
- [qr-code-generator.com](https://www.qr-code-generator.com)
- URL a usar: `https://tu-app.vercel.app`

### Opción 2 — Línea de comandos
```bash
npx qrcode-terminal "https://tu-app.vercel.app"
```

### Opción 3 — Con Node.js (genera imagen PNG)
```bash
npm install qrcode
node -e "require('qrcode').toFile('qr.png', 'https://tu-app.vercel.app', {width:400, margin:2})"
```

**Tip:** Podés personalizar el QR con colores naranjas de Plum en qr.io.

---

## 🔧 Desarrollo Local

```bash
# Clonar e instalar
git clone https://github.com/TU_USUARIO/plum-liga.git
cd plum-liga
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# (Editar .env.local con tus keys de Supabase)

# Levantar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🔐 Panel Admin

- URL: `https://tu-app.vercel.app/admin`
- Password: el que configuraste en `NEXT_PUBLIC_ADMIN_PASSWORD`
- **Por defecto en desarrollo:** `plum2024admin`

**Cambiar password:** En Vercel → Environment Variables → editar `NEXT_PUBLIC_ADMIN_PASSWORD`

---

## 📊 Funciones del Panel Admin

| Función | Descripción |
|---------|------------|
| ✅ Ver votos en tiempo real | Se actualiza automáticamente con Supabase Realtime |
| 📊 Barras de progreso | Porcentaje por elenco con animaciones |
| ➕ Crear evento | Crea nuevo evento y cierra el anterior |
| 🔴 Cerrar votación | Desactiva el evento sin borrar datos |
| 🔄 Reiniciar votos | Borra todos los votos del evento actual |
| 📥 Exportar CSV | Descarga votos del evento en formato CSV |
| 📱 URL para QR | Muestra la URL pública del app |

---

## 🛡️ Anti-fraude

- 1 voto por dispositivo por evento (UUID guardado en `localStorage`)
- Constraint `UNIQUE (device_id, evento_id)` en la base de datos
- Doble verificación: frontend + base de datos
- Si el usuario borra cookies/localStorage puede votar de nuevo (limitación conocida)

---

## 🎨 Personalización

### Cambiar nombres de elencos
Editar `/lib/supabase.ts`:
```typescript
export const ELENCOS: ElencoConfig[] = [
  { id: 'elenco_a', nombre: 'Los Furiosos', emoji: '🎭', ... },
  // etc.
]
```

### Cambiar colores
Editar `/tailwind.config.js` en la sección `colors.plum`.

### Cambiar password admin
Variable de entorno `NEXT_PUBLIC_ADMIN_PASSWORD` en Vercel.

---

## 📁 Estructura del Proyecto

```
plum-liga/
├── app/
│   ├── layout.tsx          # Layout root con fuentes
│   ├── globals.css         # Estilos globales + animaciones
│   ├── page.tsx            # 🏠 Página principal (votación pública)
│   ├── gracias/
│   │   └── page.tsx        # 🙏 Pantalla post-voto
│   └── admin/
│       └── page.tsx        # 🔐 Panel administrador
├── lib/
│   ├── supabase.ts         # Cliente Supabase + tipos + ELENCOS
│   └── device.ts           # Gestión de device ID (anti-fraude)
├── supabase-schema.sql     # SQL para ejecutar en Supabase
├── tailwind.config.js      # Config Tailwind + colores Plum
├── next.config.js
├── tsconfig.json
├── .env.local              # Variables de entorno (NO subir a git)
└── README.md
```

---

## 🆘 Problemas Comunes

**"Error: Invalid API key"**  
→ Verificar `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Vercel

**"No se puede votar / error al insertar"**  
→ Verificar que las políticas RLS estén correctamente aplicadas en Supabase

**"Panel admin no carga datos"**  
→ Verificar que existe al menos un evento en la tabla `eventos`

**"El QR no funciona"**  
→ Asegurarse de usar la URL de Vercel con HTTPS, no localhost

---

*Desarrollado con ❤️ para la Liga Mendocina de Improvisación*  
*Auspicia: Jugos Plum 🍊*
