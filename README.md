# 🪦 Cementerio de Secretos v1.1 PRO

Plataforma para compartir secretos anónimos con moderación automática, sistema de admin avanzado y reacciones en tiempo real.

## 🚀 Características

- ✅ **Detección No Destructiva**: URLs y palabras prohibidas marcadas como sospechosas
- ✅ **Panel Admin**: Estadísticas, eliminar, fijar secretos
- ✅ **Reacciones**: Fuego 🔥 y Corazón ❤️
- ✅ **Respuestas Anidadas**: Hilos dentro de secretos
- ✅ **Dark Mode**: Interfaz completa con Glassmorphism
- ✅ **Iconografía Lucide**: Sin emojis, iconos nativos
- ✅ **Monospace**: Fuente Courier New en toda la aplicación

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL (Render o similar)
- Cuenta en Vercel

## 🔧 Instalación Local

### 1. Clonar y configurar

```bash
git clone <tu-repo>
cd cementerio-secretos
npm install
```

### 2. Variables de entorno (.env.local)

```
DATABASE_URL=postgresql://user:password@db.render.com:5432/cementerio
JWT_SECRET=tu_secret_key_aqui
ADMIN_PASSWORD=Cementerio2025_Root
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Crear base de datos

Ejecuta el script `database.sql` en tu PostgreSQL:

```bash
psql -U postgres -d tu_db -f database.sql
```

### 4. Ejecutar localmente

```bash
npm run dev
# Visita http://localhost:3000
```

## 🚀 Deploy en Vercel

### 1. Preparar repositorio

```bash
git add .
git commit -m "Initial commit: Cementerio v1.1 PRO"
git push origin main
```

### 2. Crear proyecto en Vercel

- Ve a [vercel.com](https://vercel.com)
- Click "New Project"
- Conecta tu repositorio GitHub
- Configura variables de entorno en Vercel:
  - `DATABASE_URL`: Tu string de conexión PostgreSQL
  - `JWT_SECRET`: Clave secreta para JWT
  - `ADMIN_PASSWORD`: Contraseña admin (por defecto: `Cementerio2025_Root`)
  - `NEXT_PUBLIC_API_URL`: URL de tu app en Vercel

### 3. Deploy

```bash
vercel --prod
```

## 🔐 Credenciales Admin

**Username**: `admin`
**Password**: `Cementerio2025_Root`

(Cambiar en variables de entorno en producción)

## 📊 Endpoints API

### Secretos

- `GET /api/secrets` - Obtener secretos (orden: pinned, fecha)
- `POST /api/secrets` - Crear nuevo secreto

### Interacciones

- `GET /api/interactions?secretId=X` - Obtener respuestas anidadas
- `POST /api/interactions` - Reaccionar, reportar
- `DELETE /api/interactions?secretId=X` - Eliminar (admin)
- `PATCH /api/interactions` - Fijar/desfijar (admin)

### Admin

- `POST /api/admin/auth` - Login admin
- `GET /api/admin/stats` - Obtener estadísticas (requiere token)

## 🎨 Personalizaciones

### Colores
- Primario: `#00ff41` (Verde neón)
- Fondo: `#000000` (Negro puro)
- Peligro: `#ff1744` (Rojo)
- Admin: `#ffd700` (Oro)
- Pinned: `#ff00ff` (Púrpura)

### Fuentes
- Font Family: `Courier New`, monospace

### Bordes
- Border Radius: `20px` (botones), `12px` (cards)

## 📁 Estructura de Archivos

```
.
├── pages/
│   ├── api/
│   │   ├── secrets.js
│   │   ├── interactions.js
│   │   └── admin/
│   │       ├── auth.js
│   │       └── stats.js
│   └── index.js
├── public/
│   └── styles.css
├── lib/
│   ├── db.js
│   ├── moderation.js
│   └── auth.js
├── database.sql
├── package.json
├── next.config.js
├── vercel.json
└── README.md
```

## 🔒 Seguridad

- ✅ JWT con expiración de 24h
- ✅ Sanitización HTML en contenido
- ✅ SSL en conexión PostgreSQL
- ✅ Validación de credenciales admin
- ✅ Rate limiting recomendado en Vercel

## 🐛 Reportar Bugs

Email: admin@cementerio-secretos.com

## 📝 Licencia

MIT

---

**Cementerio de Secretos v1.1 PRO** - Donde los secretos encuentran paz eterna 🕊️
