# ☁️ Mainroot Cloud & Infrastructure

Este directorio contiene la configuración de infraestructura y despliegue del proyecto.

## 🐳 Docker Compose

Para facilitar el desarrollo y despliegue, utilizamos Docker Compose.

### 🛠️ Desarrollo Local (con Hot-Reload)
Para correr el proyecto en modo desarrollo (con recarga automática al editar código):

```bash
docker-compose -f cloud/docker-compose.dev.yml up -d
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

### 🚀 Producción
Para simular o desplegar el entorno de producción (Backend + Nginx):

```bash
docker-compose -f cloud/docker-compose.yml up -d
```

---

## 📈 Próximas Mejoras (Enterprise Level)
1. **CI/CD Pipelines:** Automatización de pruebas y despliegue en GitHub Actions.
2. **Audit Logging:** Registro de todas las acciones críticas de los usuarios.
3. **Redis Caching:** Optimización de velocidad para consultas frecuentes.
4. **Monitoring:** Integración con herramientas como Prometheus o Grafana.
