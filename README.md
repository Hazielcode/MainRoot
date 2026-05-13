# 🏗️ Mainroot Enterprise

<div align="center">

![Mainroot](https://img.shields.io/badge/Mainroot-Enterprise-367CFC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjIyIiBmaWxsPSIjMzY3Q0ZDIi8+PHRleHQgeD0iNTAiIHk9IjY4IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNTIiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NPC90ZXh0Pjwvc3ZnPg==)

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

**Sistema de gestión de inventario empresarial con arquitectura Zero Trust,
control de acceso granular (RBAC/ABAC), MFA y auditoría en tiempo real.**

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura de Seguridad](#-arquitectura-de-seguridad)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración de Base de Datos](#-configuración-de-base-de-datos)
- [Uso](#-uso)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Screenshots](#-screenshots)

---

## ✨ Características

### Backend
- 🔐 **Autenticación JWT** con tokens firmados (HS256, expiración 8h)
- 🛡️ **MFA/TOTP** compatible con Google Authenticator (máx. 3 intentos)
- 👥 **RBAC** — Control de acceso basado en roles (Admin, Gerente, Empleado, Auditor)
- 🎯 **ABAC** — Control granular por atributos (tienda, campos, productos premium)
- 📋 **Audit Trail** — Registro inmutable de todas las acciones CRUD
- 🚫 **Rate Limiting** — Bloqueo de cuenta tras 5 intentos fallidos (15 min)
- 🔒 **Password Policy** — Mín 8 chars, mayúscula, número, carácter especial, bcrypt (12 rounds)
- ⚡ **Error Handler Global** — Respuestas uniformes con manejo de errores PostgreSQL

### Frontend
- 🎨 **Design System Paqari** — Estética premium con gradientes y micro-animaciones
- 🌙 **Dark Mode** — Toggle con persistencia automática
- 📊 **Dashboard en Tiempo Real** — KPIs, gráficos interactivos, actividad reciente
- 🔍 **Búsqueda y Filtros** — Filtrado por entidad, acción, categoría y sucursal
- 📱 **Responsive** — Adaptado para desktop y tablet
- 🛡️ **Protección de Rutas** — Validación de JWT + verificación de roles
- 👤 **AuthContext** — Estado global de sesión con decodificación JWT client-side
- 🔄 **Interceptor 401** — Redirección automática al expirar la sesión

---

## 🛡️ Arquitectura de Seguridad

### Matriz de Permisos (RBAC + ABAC)

| Rol | SELECT | INSERT | UPDATE | DELETE | Alcance |
|-----|--------|--------|--------|--------|---------|
| **Admin** | ✅ Global | ✅ Cualquier tienda | ✅ Todos los campos | ✅ Todos | Sin restricciones |
| **Gerente** | ✅ Su tienda | ✅ Su tienda | ✅ Excepto `categoría` | ✅ No premium | Solo su sucursal |
| **Empleado** | ✅ Su tienda | ✅ No premium | ✅ Solo `stock` | ❌ | Solo su sucursal |
| **Auditor** | ✅ Global | ❌ | ❌ | ❌ | Solo lectura global |

### Capas de Seguridad

```
Request → Helmet → CORS → Morgan → JWT Auth → RBAC → ABAC → Controller → Audit Log
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Backend** | Node.js 22, Express 5, PostgreSQL 16 |
| **Autenticación** | JWT (jsonwebtoken), bcrypt, otplib (TOTP), qrcode |
| **Frontend** | React 19, Vite 8, React Router 7 |
| **Visualización** | Recharts 3, Lucide Icons |
| **HTTP Client** | Axios (con interceptores JWT + 401) |
| **Seguridad HTTP** | Helmet, CORS |
| **Logging** | Morgan |

---

## 📁 Estructura del Proyecto

```
mainroot/
├── backend/
│   └── src/
│       ├── config/          # Pool de conexiones PostgreSQL
│       ├── controllers/     # Auth, MFA, Products, Users, Roles, Stores, Audit
│       ├── middlewares/     # JWT Auth, RBAC, ABAC, Error Handler
│       ├── models/          # Acceso a datos con SQL parameterizado
│       ├── routes/          # Definición de endpoints REST
│       ├── services/        # AuthService, AuditService
│       └── utils/           # MFA/TOTP generation
├── frontend/
│   └── src/
│       ├── components/      # DashboardLayout (sidebar + topbar)
│       ├── context/         # AuthContext (estado global de sesión)
│       ├── pages/           # Login, MFA, Register, Dashboard, Inventory...
│       └── services/        # Axios con interceptores
├── database/
│   └── database.sql         # Schema completo + seed data
├── docs/
│   └── API_DOCUMENTATION.md # Documentación detallada de la API
└── README.md
```

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **PostgreSQL** 14+ (local o [Supabase](https://supabase.com/))

### 1. Clonar el repositorio

```bash
git clone https://github.com/Hazielcode/MainRoot.git
cd MainRoot
```

### 2. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurar variables de entorno

Crear el archivo `backend/.env`:

```env
# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=mainroot_db

# JWT
JWT_SECRET=cambia_esto_por_un_secreto_seguro_de_64_chars

# Servidor
PORT=3000
NODE_ENV=development
```

### 4. Configurar la base de datos

```bash
# Ejecutar el schema en tu instancia de PostgreSQL
psql -U postgres -d mainroot_db -f database/database.sql
```

> **💡 Tip:** Si usas Supabase, copia el contenido de `database/database.sql` en el SQL Editor de tu proyecto.

### 5. Iniciar los servidores

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

El backend arranca en `http://localhost:3000` y el frontend en `http://localhost:5173`.

---

## 📡 Endpoints de la API

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registro de nuevo usuario |
| `POST` | `/api/auth/login` | Login (retorna JWT o `mfaRequired`) |
| `POST` | `/api/auth/mfa/setup` | Generar QR Code TOTP |
| `POST` | `/api/auth/mfa/enable` | Activar MFA |
| `POST` | `/api/auth/mfa/validate` | Validar código TOTP |

### Productos (ABAC)
| Método | Ruta | Roles |
|--------|------|-------|
| `GET` | `/api/products` | Todos |
| `GET` | `/api/products/stats` | Admin, Gerente, Auditor |
| `POST` | `/api/products` | Admin, Gerente, Empleado |
| `PUT` | `/api/products/:id` | Admin, Gerente, Empleado |
| `DELETE` | `/api/products/:id` | Admin, Gerente |

### Usuarios (Admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/users` | Listar usuarios con roles |
| `GET` | `/api/users/stats` | Estadísticas para Dashboard |
| `POST` | `/api/users/:id/roles` | Asignar rol |
| `DELETE` | `/api/users/:id/roles/:rolId` | Revocar rol |
| `PATCH` | `/api/users/:id/status` | Activar/Desactivar cuenta |

### Auditoría (Admin, Auditor)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/audit` | Logs con filtros (entidad, acción, fechas) |
| `GET` | `/api/audit/stats` | Estadísticas de auditoría |

> 📖 Documentación completa en [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)

---

## 👨‍💻 Autor

**Haziel** — [@Hazielcode](https://github.com/Hazielcode)

---

<div align="center">

*Desarrollado con ❤️ y arquitectura Zero Trust*

</div>
