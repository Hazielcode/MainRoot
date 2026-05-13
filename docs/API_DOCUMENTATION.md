# 🏗️ Mainroot Enterprise — Documentación del Sistema

## Arquitectura General

```
mainroot/
├── backend/               # API REST (Node.js + Express 5)
│   └── src/
│       ├── config/        # Pool de conexiones PostgreSQL
│       ├── controllers/   # Lógica de negocio (Auth, MFA, Products, Users, Roles, Stores, Audit)
│       ├── middlewares/    # Auth (JWT), RBAC (roles), ABAC (atributos), Error Handler
│       ├── models/        # Acceso a datos (SQL parameterizado)
│       ├── routes/        # Definición de endpoints REST
│       ├── services/      # Servicios de negocio (AuthService, AuditService)
│       └── utils/         # Utilidades (MFA/TOTP generation)
├── frontend/              # SPA (React 19 + Vite)
│   └── src/
│       ├── components/    # Layout reutilizable (DashboardLayout)
│       ├── context/       # AuthContext (estado global de sesión)
│       ├── pages/         # Vistas (Login, MFA, Register, Dashboard, Inventory, etc.)
│       └── services/      # Axios interceptors (JWT auto-injection + 401 handling)
├── database/              # Schema SQL (PostgreSQL)
└── docs/                  # Esta documentación
```

## Sistema de Seguridad

### Modelo de Acceso: RBAC + ABAC

| Rol | SELECT | INSERT | UPDATE | DELETE | Alcance |
|-----|--------|--------|--------|--------|---------|
| **Admin** | ✅ Global | ✅ Cualquier tienda | ✅ Todos los campos | ✅ Todos | Sin restricciones |
| **Gerente** | ✅ Su tienda | ✅ Su tienda | ✅ Excepto `categoría` | ✅ No premium | Solo su sucursal |
| **Empleado** | ✅ Su tienda | ✅ No premium | ✅ Solo `stock` | ❌ | Solo su sucursal |
| **Auditor** | ✅ Global | ❌ | ❌ | ❌ | Solo lectura global |

### Seguridad Implementada

1. **JWT (JSON Web Tokens)** — Tokens firmados con HS256, expiración 8h
2. **MFA (TOTP)** — Google Authenticator compatible, max 3 intentos
3. **Rate Limiting (Login)** — 5 intentos fallidos = bloqueo 15 minutos
4. **Audit Trail** — Todas las acciones CRUD quedan registradas con IP, usuario, datos antes/después
5. **Password Policy** — Mín 8 chars, 1 mayúscula, 1 número, 1 carácter especial, bcrypt (12 rounds)
6. **Account Lockout** — Desactivación de cuentas sin eliminación (soft delete)

## Endpoints de la API

### Auth
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registro de nuevo usuario | ❌ |
| POST | `/api/auth/login` | Login (puede devolver `mfaRequired`) | ❌ |
| POST | `/api/auth/mfa/setup` | Generar QR Code para TOTP | ❌ |
| POST | `/api/auth/mfa/enable` | Activar MFA con código de verificación | ❌ |
| POST | `/api/auth/mfa/validate` | Validar código TOTP durante login | ❌ |
| GET | `/api/auth/me` | Datos del usuario autenticado | ✅ JWT |

### Products (ABAC)
| Método | Ruta | Descripción | Auth | RBAC |
|--------|------|-------------|------|------|
| GET | `/api/products` | Listar productos (filtrado ABAC por tienda) | ✅ | All |
| GET | `/api/products/stats` | Estadísticas para Dashboard | ✅ | Admin, Auditor, Gerente |
| POST | `/api/products` | Crear producto | ✅ | Admin, Gerente, Empleado |
| PUT | `/api/products/:id` | Actualizar producto | ✅ | Admin, Gerente, Empleado |
| DELETE | `/api/products/:id` | Eliminar producto | ✅ | Admin, Gerente |

### Users (Admin only)
| Método | Ruta | Descripción | Auth | RBAC |
|--------|------|-------------|------|------|
| GET | `/api/users` | Listar usuarios con roles | ✅ | Admin |
| GET | `/api/users/stats` | Estadísticas de usuarios | ✅ | Admin |
| POST | `/api/users/:id/roles` | Asignar rol | ✅ | Admin |
| DELETE | `/api/users/:id/roles/:rolId` | Revocar rol | ✅ | Admin |
| PATCH | `/api/users/:id/status` | Activar/Desactivar cuenta | ✅ | Admin |

### Stores
| Método | Ruta | Descripción | Auth | RBAC |
|--------|------|-------------|------|------|
| GET | `/api/stores` | Listar sucursales | ✅ | All |
| POST | `/api/stores` | Crear sucursal | ✅ | Admin |
| PUT | `/api/stores/:id` | Editar sucursal | ✅ | Admin |
| DELETE | `/api/stores/:id` | Eliminar sucursal | ✅ | Admin |

### Roles
| Método | Ruta | Descripción | Auth | RBAC |
|--------|------|-------------|------|------|
| GET | `/api/roles` | Listar roles | ✅ | All |
| POST | `/api/roles` | Crear rol | ✅ | Admin |
| PUT | `/api/roles/:id` | Editar rol | ✅ | Admin |
| DELETE | `/api/roles/:id` | Eliminar rol | ✅ | Admin |

### Audit
| Método | Ruta | Descripción | Auth | RBAC |
|--------|------|-------------|------|------|
| GET | `/api/audit` | Listar logs (soporta filtros: entidad, accion, usuario_id, desde, hasta) | ✅ | Admin, Auditor |
| GET | `/api/audit/stats` | Estadísticas de auditoría | ✅ | Admin, Auditor |

## Setup Rápido

```bash
# 1. Backend
cd backend
npm install
# Configurar .env con credenciales de PostgreSQL
npm run dev

# 2. Frontend  
cd frontend
npm install
npm run dev

# 3. Base de datos
# Ejecutar database/database.sql en PostgreSQL
```

## Stack Tecnológico

- **Backend**: Node.js, Express 5, PostgreSQL, JWT, bcrypt, otplib (TOTP), qrcode
- **Frontend**: React 19, Vite 8, React Router 7, Recharts 3, Lucide Icons, Axios
- **Design System**: CSS custom properties, Paqari-inspired theme, Dark mode
