# 🐾 Safe Haven - Plataforma Full-Stack de Adopción Animal

**Safe Haven** es una plataforma web profesional que conecta animales que necesitan hogar con familias que buscan amor incondicional.

## ✨ Características

### 🔐 **Autenticación Completa**
- Registro y login con JWT
- Contraseñas encriptadas con bcrypt
- Sesiones seguras con cookies httpOnly

### 🐾 **Gestión de Mascotas**
- CRUD completo de animales
- Búsqueda en tiempo real
- Filtros por tipo y estado
- Geolocalización automática

### 🗺️ **Mapa Interactivo**
- Leaflet con OpenStreetMap
- Marcadores dinámicos por estado
- Popups informativos
- Casos urgentes destacados

### 📊 **Estadísticas en Tiempo Real**
- Contadores dinámicos desde MongoDB
- Distribución por tipo y ubicación
- Casos urgentes y adopciones

## 🏗️ Arquitectura

\`\`\`
Safe Haven
├── Frontend (Next.js 14 + React 18)
├── Backend (API Routes + MongoDB)
├── Autenticación (JWT + bcrypt)
├── Base de Datos (MongoDB Atlas)
└── UI (Tailwind CSS + shadcn/ui)
\`\`\`

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- npm, yarn o pnpm
- MongoDB Atlas cuenta (gratuita)
- Mailgun cuenta (para emails)
- Cloudinary cuenta (para imágenes)

### Pasos

1. **Clonar el repositorio**
   \`\`\`bash
   git clone https://github.com/tu-usuario/safehaven.git
   cd safehaven
   \`\`\`

2. **Instalar dependencias**
   \`\`\`bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   \`\`\`

3. **Configurar variables de entorno**
   
   Copia el archivo de ejemplo:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edita \`.env.local\` con tus credenciales reales:
   
   \`\`\`env
   # MongoDB - Obtén de MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   
   # JWT Secret - Genera uno seguro
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Next.js
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Mailgun - Para envío de emails
   MAILGUN_API_KEY=your-mailgun-api-key
   MAILGUN_DOMAIN=your-mailgun-domain
   FROM_EMAIL=noreply@yourdomain.com
   
   # Cloudinary - Para subir imágenes
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   \`\`\`

4. **Configurar servicios externos**

   #### MongoDB Atlas
   - Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Crea un cluster gratuito
   - Obtén la connection string y reemplaza en `MONGODB_URI`

   #### Mailgun
   - Regístrate en [Mailgun](https://www.mailgun.com/)
   - Verifica tu dominio o usa el sandbox
   - Obtén API key y domain

   #### Cloudinary
   - Crea cuenta en [Cloudinary](https://cloudinary.com/)
   - Obtén cloud name, API key y secret

5. **Ejecutar en desarrollo**
   \`\`\`bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   \`\`\`

6. **Abrir navegador**
   \`\`\`
   http://localhost:3000
   \`\`\`

### Scripts disponibles
- \`npm run dev\` - Desarrollo
- \`npm run build\` - Build de producción
- \`npm run start\` - Servidor de producción
- \`npm run lint\` - Linting
- \`npm run optimize-db\` - Optimizar base de datos

## 🗄️ Base de Datos

### Modelos MongoDB

#### Usuario
\`\`\`typescript
interface User {
  _id: ObjectId
  name: string
  email: string (único)
  phone: string
  password: string (hasheado)
  createdAt: Date
  updatedAt: Date
}
\`\`\`

#### Mascota
\`\`\`typescript
interface Pet {
  _id: ObjectId
  name: string
  type: 'perro' | 'gato' | 'conejo' | 'ave' | 'otros'
  breed?: string
  age?: string
  location: string
  description: string
  image?: string
  status: 'adopcion' | 'rescate' | 'cuidados' | 'temporal'
  urgent: boolean
  contact: string
  lat: number
  lng: number
  userId: ObjectId
  createdAt: Date
  updatedAt: Date
}
\`\`\`

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Mascotas
- `GET /api/pets` - Listar con filtros
- `POST /api/pets` - Crear (autenticado)
- `GET /api/pets/[id]` - Obtener por ID
- `PUT /api/pets/[id]` - Actualizar (propietario)
- `DELETE /api/pets/[id]` - Eliminar (propietario)

### Estadísticas
- `GET /api/stats` - Estadísticas en tiempo real

## 🛠️ Tecnologías

### Backend
- **Next.js 14** - Framework full-stack
- **MongoDB Atlas** - Base de datos
- **Mongoose** - ODM
- **JWT** - Autenticación
- **bcrypt** - Encriptación

### Frontend
- **React 18** - UI Library
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes
- **Leaflet** - Mapas

## 📁 Estructura del Proyecto

\`\`\`
safe-haven/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (pages)/           # Páginas
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   └── ...               # Componentes personalizados
├── hooks/                # Custom hooks
├── lib/                  # Utilidades
│   ├── mongodb.ts        # Conexión DB
│   ├── auth.ts          # Utilidades auth
│   └── constants.ts     # Constantes
├── models/               # Modelos Mongoose
├── types/                # Tipos TypeScript
└── ...                   # Configuración
\`\`\`

## 🔐 Seguridad

- **JWT tokens** con expiración
- **Cookies httpOnly** seguras
- **Contraseñas hasheadas** (bcrypt)
- **Validación** de datos completa
- **Autorización** por usuario

## 🚀 Deploy

### Vercel (Recomendado)
1. Push a GitHub
2. Conectar con Vercel
3. Configurar variables de entorno en Vercel
4. Deploy automático ✅

### Otros proveedores
- Compatible con Netlify, Railway, etc.
- Asegúrate de configurar todas las variables de entorno

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

### Guías de contribución
- Usa TypeScript para nuevo código
- Sigue las convenciones de ESLint
- Añade tests para nuevas funcionalidades
- Actualiza la documentación si es necesario

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Desarrollado por

**Bush Coding** - [bushcoding.com](https://bushcoding.com)

*"Bring your ideas to life with Bush Coding"*

---

## 🎯 Estado del Proyecto

✅ **100% Funcional**  
✅ **Base de datos real** (MongoDB)  
✅ **Autenticación completa** (JWT)  
✅ **API profesional** (validaciones)  
✅ **Frontend responsive** (móvil)  
✅ **Deploy ready** (producción)  

**Safe Haven** - Tu refugio seguro para adoptar, rescatar y amar 🐾❤️
