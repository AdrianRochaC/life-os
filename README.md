# LifeOS — Sistema Personal Modular (Angular + NestJS + MongoDB + Docker)

Sistema personal para organizar **metas de compra** (moto, PC, viajes), **finanzas** y **estudio**, construido con arquitectura modular por dominio.

## Estructura del Proyecto

```text
life-os/
├── docker-compose.yml       # Orquesta MongoDB + Backend NestJS + Frontend Angular (Nginx)
├── .env.example             # Variables de entorno (local y Docker)
├── backend/                 # NestJS 12 + TypeScript + Mongoose + Swagger
│   └── src/
│       ├── config/          # Configuración y validación de variables de entorno
│       ├── common/          # Pipes (ParseObjectIdPipe) y filtros globales de error
│       └── modules/
│           ├── health/      # GET /api/health (estado de API y MongoDB)
│           └── goals/       # Módulo piloto completo (controller, service, dto, schemas)
└── frontend/                # Angular 22 (Standalone + Signals + Lazy Routing)
    └── src/app/
        ├── core/            # Layout principal (Shell) y servicios base
        ├── shared/          # Pipes y utilidades reutilizables
        └── features/
            ├── goals/       # Vistas, modales y store con Signals para Metas
            └── coming-soon/ # Rutas planeadas para Finanzas y Estudio
```

---

## Opción 1: Correr todo con Docker

```powershell
# Desde la raíz life-os/
Copy-Item .env.example .env
docker compose up --build
```

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000/api
- **Swagger (documentación interactiva):** http://localhost:3000/docs
- **MongoDB de Docker:** puerto `27018` en host (evita chocar con un MongoDB local en `27017`)

### ¿Quieres que Docker use TU MongoDB local de Windows?
Edita `.env` y cambia `DOCKER_MONGODB_URI`:

```env
DOCKER_MONGODB_URI=mongodb://host.docker.internal:27017/life-os
```

Y si solo quieres levantar API + Web usando tu Mongo local:

```powershell
docker compose up --build backend frontend
```

---

## Opción 2: Desarrollo local (Hot-Reload)

1. Copia `.env.example` a `.env` en la raíz (asegúrate de tener MongoDB corriendo en `localhost:27017`, o usa `docker compose up -d mongo` y pon puerto `27018`).
2. **Terminal 1 — Backend:**
   ```powershell
   cd backend
   npm run start:dev
   ```
   API en `http://localhost:3000/api` y Swagger en `http://localhost:3000/docs`.
3. **Terminal 2 — Frontend:**
   ```powershell
   cd frontend
   npm start
   ```
   App en `http://localhost:4200` (el proxy reenvía `/api` al puerto `3000`).

---

## Comandos de verificación

```powershell
# Backend
cd backend
npm run lint
npm run build
npm test

# Frontend
cd frontend
npm run build
npm test
```

