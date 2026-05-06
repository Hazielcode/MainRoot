-- Schema para Mainroot (Arquitectura de Élite)

-- 1. Tabla de Roles (No se puede eliminar un rol si está en uso)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Tiendas (Requisito para ABAC)
CREATE TABLE tiendas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    tienda_id INTEGER REFERENCES tiendas(id) ON DELETE RESTRICT,
    mfa_habilitado BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Usuario_Roles (Asignación M:N con trazabilidad)
CREATE TABLE usuario_roles (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id INTEGER REFERENCES roles(id) ON DELETE RESTRICT,
    asignado_por INTEGER REFERENCES usuarios(id),
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, rol_id)
);

-- 5. Tabla de Productos (Control ABAC)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    categoria VARCHAR(100),
    tienda_id INTEGER REFERENCES tiendas(id) ON DELETE RESTRICT,
    es_premium BOOLEAN DEFAULT FALSE,
    creado_por INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Auditoría (Audit Logs Enterprise)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(50) NOT NULL, -- 'UPDATE_PRECIO', 'DELETE_PRODUCTO', etc.
    entidad VARCHAR(50) NOT NULL, -- 'productos', 'usuarios'
    entidad_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles base (Semilla)
INSERT INTO roles (nombre, descripcion) VALUES 
('Admin', 'Acceso total al sistema (Full CRUD)'),
('Gerente', 'Gestión de productos y reportes locales de su tienda'),
('Empleado', 'Actualización de stock de su tienda (Sin modificar precios)'),
('Auditor', 'Lectura global y generación de reportes');
