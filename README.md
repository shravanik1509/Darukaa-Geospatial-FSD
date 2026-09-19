# Darukaa.Earth - Geospatial ESG & Carbon Analytics Platform

[![CI Pipeline](https://github.com/darukaa/darukaa-geospatial-fsd/actions/workflows/ci.yml/badge.svg)](https://github.com/darukaa/darukaa-geospatial-fsd/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4-336791.svg)](https://postgis.net/)
[![Mapbox](https://img.shields.io/badge/Mapbox%20GL%20JS-v3-000000.svg?logo=mapbox&logoColor=white)](https://www.mapbox.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, full-stack geospatial data analytics platform engineered for the **Darukaa.Earth Full-Stack Developer Hackathon Challenge**. This platform empowers conservation managers and ESG compliance auditors to manage, map, monitor, and visualize high-integrity carbon sequestration and biodiversity restoration programs across the globe.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Business Problem](#2-business-problem)
3. [Core Features](#3-core-features)
4. [Architecture Diagram](#4-architecture-diagram)
5. [Technology Stack](#5-technology-stack)
6. [Monorepo Folder Structure](#6-monorepo-folder-structure)
7. [Database Schema](#7-database-schema)
8. [PostGIS Spatial Implementation](#8-postgis-spatial-implementation)
9. [REST API Specification](#9-rest-api-specification)
10. [Authentication & Authorization Flow](#10-authentication--authorization-flow)
11. [Mapbox Setup & Configuration](#11-mapbox-setup--configuration)
12. [Environment Variables Reference](#12-environment-variables-reference)
13. [Local Development Setup](#13-local-development-setup)
14. [Docker & PostGIS Setup](#14-docker--postgis-setup)
15. [Database Migrations (Alembic)](#15-database-migrations-alembic)
16. [Seed & Demonstration Data](#16-seed--demonstration-data)
17. [Running the Frontend](#17-running-the-frontend)
18. [Running the Backend](#18-running-the-backend)
19. [Automated Testing](#19-automated-testing)
20. [Code Quality & Formatting](#20-code-quality--formatting)
21. [Pre-commit Hooks](#21-pre-commit-hooks)
22. [GitHub Actions CI/CD Pipeline](#22-github-actions-cicd-pipeline)
23. [Production Deployment Guide](#23-production-deployment-guide)
24. [Known Limitations](#24-known-limitations)
25. [Technical Trade-offs](#25-technical-trade-offs)
26. [Future Roadmap](#26-future-roadmap)

---

## 1. Project Overview
The Darukaa.Earth Geospatial ESG Platform provides an end-to-end framework for nature-based solutions (NbS). The application bridges satellite mapping, interactive polygonal drawing, geospatial database indexing, and time-series ecological analytics into a single high-performance SaaS dashboard.

---

## 2. Business Problem
Global carbon credit markets and biodiversity conservation initiatives suffer from:
1. **Opaque boundary auditing**: Parcels are often vaguely geo-referenced using only approximate centroid pins rather than legally binding polygonal boundaries.
2. **Disconnected multi-temporal metrics**: Verification records are siloed across disconnected spreadsheets, preventing auditors from seeing how canopy cover, biodiversity species richness, and soil carbon evolve over quarterly cycles.
3. **Double-counting and spatial overlap**: Without native spatial indexing (such as PostGIS R-tree/GIST indexing), organizations cannot verify that parcels do not overlap neighboring concessions.

Darukaa.Earth solves this with native PostGIS polygonal boundary tracking, strict GeoJSON topology validation, and unified time-series visualization.

---

## 3. Core Features
- **Role-Based Access Control (RBAC)**: Secure JWT authentication with distinct capabilities for `ADMIN` (create projects, draw polygon sites, log observations) and `USER` (explore maps, analyze trends).
- **Interactive Mapbox Draw Parcel Studio**: Trace conservation parcel boundaries directly onto satellite imagery with real-time browser geodesic area preview.
- **True Geodesic Calculations**: Backend PostGIS automatically calculates ellipsoidal geodesic surface area via `ST_Area(geometry::geography) / 10000.0` and centroid coordinates via `ST_Centroid(geometry)`.
- **Environmental Time-Series Visualizations**: Chart.js charts displaying:
  1. *Carbon Sequestration Stock ($tCO_2e/ha$)* with gradient fill.
  2. *Biodiversity Recovery Index ($0.0 - 5.0$ Shannon $H'$)*.
  3. *Dual-axis Vegetation Index (NDVI) & Canopy Cover %*.
- **Spatial Explorer**: Filter across projects, search sites, inspect popups, and highlight selected polygons on Mapbox.
- **Enterprise Code Quality**: Ruff formatting and linting, ESLint 9, Prettier, TypeScript strict mode, and full Pytest integration suite.

---

## 4. Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          REACT FRONTEND SPA                            │
│  - React 18 + TypeScript + Vite 6 + Tailwind CSS                      │
│  - Mapbox GL JS v3 + Mapbox Draw (WGS84 Polygon Tracing)              │
│  - Chart.js 4 (Carbon, Biodiversity, NDVI Time-Series Curves)          │
│  - AuthContext + Axios Interceptors (JWT Bearer Injection)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / GeoJSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND CORE                           │
│  - FastAPI 0.115+ with Pydantic v2 validation                          │
│  - Python 3.14 compatible async architecture                           │
│  - Security: Bcrypt (12 rounds) + PyJWT (HS256)                        │
│  - GeoAlchemy2 + Shapely 2.0 Spatial Geometry Layer                    │
│  - Alembic Database Migration Management                               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ psycopg 3 / Binary PostGIS
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   POSTGRESQL 16 + POSTGIS 3.4 (Docker)                 │
│  - Spatial Extension: postgis enabled                                  │
│  - Column: geometry(Polygon, 4326)                                     │
│  - Spatial Index: GIST on sites.geometry                               │
│  - Geodesic Functions: ST_Area, ST_Centroid, ST_AsGeoJSON              │
│  - Persistent Docker Volume (postgis_data)                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript 5, Vite 6, Tailwind CSS, Lucide Icons |
| **Mapping** | Mapbox GL JS v3.8, `@mapbox/mapbox-gl-draw` v1.4 |
| **Data Viz** | Chart.js 4.4, `react-chartjs-2` 5.2 |
| **Backend** | Python 3.14 / 3.12, FastAPI, Pydantic v2, Pydantic-Settings |
| **ORM & Spatial**| SQLAlchemy 2.0, GeoAlchemy2, Shapely 2.1, psycopg 3.3 (binary) |
| **Database** | PostgreSQL 16.4, PostGIS 3.4.3 |
| **Auth** | PyJWT, Passlib, Bcrypt |
| **Migrations** | Alembic 1.14+ |
| **Testing** | Pytest 9.1, HTTPX, FastAPI TestClient |
| **Code Quality** | Ruff 0.16 (linter + formatter), ESLint 9, Prettier |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI/CD |

---

## 6. Monorepo Folder Structure

```
darukaa-geospatial-fsd/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated CI: backend tests & frontend build
│       └── deploy.yml             # CD deployment automation
├── backend/
│   ├── alembic/
│   │   ├── env.py                 # GeoAlchemy2-aware Alembic environment
│   │   └── versions/              # Applied schema migration scripts
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Environment settings (Pydantic BaseSettings)
│   │   │   ├── dependencies.py    # DB session & RBAC current user dependencies
│   │   │   └── security.py        # Bcrypt hashing & PyJWT token utilities
│   │   ├── database/
│   │   │   ├── base.py            # Declarative base & Timestamp mixin
│   │   │   └── session.py         # SQLAlchemy engine & SessionLocal
│   │   ├── models/
│   │   │   ├── user.py            # User ORM model
│   │   │   ├── project.py         # Project ORM model
│   │   │   ├── site.py            # Site ORM model with PostGIS Geometry
│   │   │   └── analytics.py       # SiteAnalytics ORM model
│   │   ├── schemas/
│   │   │   ├── user.py            # Pydantic schemas for auth
│   │   │   ├── project.py         # Project request/response models
│   │   │   ├── site.py            # GeoJSON Polygon schemas & validation
│   │   │   ├── analytics.py       # Time-series & metric trend models
│   │   │   └── dashboard.py       # Global KPI summary schemas
│   │   ├── services/              # Business logic layer
│   │   ├── routers/               # FastAPI REST endpoint routes
│   │   ├── utils/
│   │   │   └── geo.py             # Shapely & GeoAlchemy2 conversions
│   │   └── main.py                # App entrypoint, CORS, error handling
│   ├── tests/                     # Automated Pytest suite
│   ├── Dockerfile
│   ├── pyproject.toml             # Ruff & Pytest configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Button, Card, Modal, Badge, Spinner, TokenWarning
│   │   │   ├── map/               # MapboxViewer, MapboxDrawStudio
│   │   │   ├── charts/            # CarbonChart, BiodiversityChart, VegetationChart
│   │   │   ├── projects/          # ProjectFormModal
│   │   │   └── sites/             # AddObservationModal
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # JWT token state & user session
│   │   ├── layouts/               # DashboardLayout & AuthLayout
│   │   ├── pages/                 # Login, Register, Dashboard, Projects, Sites, Map
│   │   ├── routes/                # Protected & Admin route guards
│   │   ├── services/              # Axios API service clients
│   │   ├── types/                 # TypeScript type definitions
│   │   └── utils/                 # Number, date, and hectare formatters
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── database/
│   ├── seed/
│   │   └── seed_data.py           # Realistic demonstration dataset generator
│   └── README.md
├── docker-compose.yml             # PostGIS 16 + volumes + optional multi-container
├── .env.example                   # Reference environment variables
├── .gitignore
├── .pre-commit-config.yaml
├── README.md
└── LICENSE
```

---

## 7. Database Schema

### Entity-Relationship Diagram

```
  ┌─────────────────────────────────┐
  │              USERS              │
  ├─────────────────────────────────┤
  │ PK  id            UUID          │
  │     name          VARCHAR(120)  │
  │ UQ  email         VARCHAR(255)  │
  │     password_hash VARCHAR(255)  │
  │     role          VARCHAR(20)   │ (ADMIN | USER)
  │     is_active     BOOLEAN       │
  │     created_at    TIMESTAMPTZ   │
  │     updated_at    TIMESTAMPTZ   │
  └────────────────┬────────────────┘
                   │ 1
                   │ has many
                   │ N
  ┌────────────────▼────────────────┐
  │            PROJECTS             │
  ├─────────────────────────────────┤
  │ PK  id                   UUID   │
  │ IX  name                 VARCHAR│
  │     description          TEXT   │
  │     project_type         VARCHAR│
  │     status               VARCHAR│
  │ FK  created_by           UUID   │ -> users.id
  │     start_date           DATE   │
  │     end_date             DATE   │
  │     target_carbon_offset FLOAT  │
  │     created_at           TIMESTAMPTZ
  │     updated_at           TIMESTAMPTZ
  └────────────────┬────────────────┘
                   │ 1
                   │ has many (CASCADE)
                   │ N
  ┌────────────────▼────────────────┐
  │              SITES              │
  ├─────────────────────────────────┤
  │ PK  id               UUID       │
  │ FK  project_id       UUID       │ -> projects.id
  │ IX  name             VARCHAR(255│
  │     description      TEXT       │
  │     ecosystem_type   VARCHAR(100│
  │     area_hectares    FLOAT      │ (PostGIS ST_Area computed)
  │     center_latitude  FLOAT      │ (PostGIS ST_Centroid computed)
  │     center_longitude FLOAT      │ (PostGIS ST_Centroid computed)
  │ GIST geometry        GEOMETRY   │ (Polygon, SRID 4326)
  │     created_at       TIMESTAMPTZ│
  │     updated_at       TIMESTAMPTZ│
  └────────────────┬────────────────┘
                   │ 1
                   │ has many (CASCADE)
                   │ N
  ┌────────────────▼────────────────┐
  │         SITE_ANALYTICS          │
  ├─────────────────────────────────┤
  │ PK  id                      UUID│
  │ FK  site_id                 UUID│ -> sites.id
  │ IX  recorded_at             TIMESTAMPTZ
  │     carbon_value            FLOAT (tCO2e/ha)
  │     biodiversity_value      FLOAT (Shannon Index 0.0 - 5.0)
  │     vegetation_value        FLOAT (NDVI -1.0 to 1.0)
  │     canopy_cover_percentage FLOAT (0.0 to 100.0%)
  │     soil_moisture_percentage FLOAT (0.0 to 100.0%)
  │     created_at              TIMESTAMPTZ
  └─────────────────────────────────┘
```

---

## 8. PostGIS Spatial Implementation
Geospatial data in Darukaa.Earth is stored using **native PostGIS geometries**:
- **Coordinate Reference System**: EPSG:4326 (WGS84 longitude/latitude degrees).
- **Column Definition**: `geometry(Polygon, 4326)`.
- **Spatial Index**: Generalized Search Tree (`GIST`) index created automatically on `sites.geometry` to accelerate bounding-box and intersection queries.
- **Geodesic Surface Area Calculation**:
  ```sql
  SELECT ST_Area(ST_SetSRID(ST_GeomFromGeoJSON(:geojson), 4326)::geography) / 10000.0;
  ```
  By casting the geometry to PostGIS `geography`, calculations operate across the WGS84 ellipsoid rather than flat Cartesian planes, providing accurate hectare counts regardless of latitude.
- **Centroid Calculation**:
  `ST_Centroid(geometry)` extracts the representative center point (`center_latitude`, `center_longitude`) for camera bounding in Mapbox.

---

## 9. REST API Specification

### Authentication
- `POST /api/auth/register` - Create user account (returns User & JWT Bearer token).
- `POST /api/auth/login` - Authenticate with email and password (returns User & JWT).
- `GET /api/auth/me` - Get profile for authenticated bearer token user.

### Projects
- `GET /api/projects` - List projects with query filters (`search`, `status`, `project_type`) and aggregated spatial stats (`total_sites`, `total_area_hectares`).
- `POST /api/projects` - Create project (`ADMIN` only).
- `GET /api/projects/{id}` - Get project details.
- `PUT /api/projects/{id}` - Update project (`ADMIN` only).
- `DELETE /api/projects/{id}` - Delete project and cascade sites (`ADMIN` only).
- `GET /api/projects/{id}/sites` - List sites belonging to a project.
- `POST /api/projects/{id}/sites` - Create a site in project with GeoJSON polygon (`ADMIN` only).

### Sites & Geospatial
- `GET /api/sites` - List all sites.
- `GET /api/sites/geojson` - Export all sites as standard `GeoJSON FeatureCollection` (used directly by Mapbox GL JS sources).
- `GET /api/sites/{id}` - Get site details including GeoJSON polygon and latest metrics.
- `PUT /api/sites/{id}` - Update site metadata or polygon geometry (`ADMIN` only).
- `DELETE /api/sites/{id}` - Delete site (`ADMIN` only).
- `GET /api/sites/{id}/analytics` - Get chronological time-series measurements and calculated metric trends.
- `POST /api/sites/{id}/analytics` - Record a new field observation (`ADMIN` only).

### Dashboard & Health
- `GET /api/dashboard/summary` - Aggregated platform KPIs (projects, sites, hectares, carbon stock, avg biodiversity, status breakdown).
- `GET /health` - Basic service liveness probe.
- `GET /health/db` - Database connectivity and PostGIS extension version verification.

FastAPI interactive OpenAPI documentation is automatically available at `http://localhost:8000/docs`.

---

## 10. Authentication & Authorization Flow
1. Passwords are encrypted using **Bcrypt (12 rounds)** before storage.
2. The user signs in via `/api/auth/login`, receiving a signed **PyJWT access token** containing user UUID, role (`ADMIN` or `USER`), issued-at (`iat`), and expiration (`exp`).
3. The React client persists the token in browser storage and attaches an `Authorization: Bearer <token>` header via Axios request interceptors.
4. FastAPI validates the token on protected routes using the `get_current_user` and `require_admin` dependency injection guards.
5. If a request returns HTTP 401, the Axios response interceptor clears expired state and redirects to `/login`.

---

## 11. Mapbox Setup & Configuration
The application integrates **Mapbox GL JS v3** for visualization and **Mapbox Draw** for interactive polygon tracing.

### Configuring the Token:
1. Create a free Mapbox account at [mapbox.com](https://www.mapbox.com/).
2. Copy your public access token (format: `pk.eyJ1...`).
3. Add the token to `frontend/.env`:
   ```bash
   VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here
   ```
4. If the token is missing or contains the default placeholder, the application gracefully renders an inline **MapboxTokenWarning** guide with direct links to the Mapbox dashboard rather than crashing.

---

## 12. Environment Variables Reference

Create a `.env` file in the root directory (based on `.env.example`):

```ini
# PostgreSQL + PostGIS (Docker)
POSTGRES_DB=darukaa_geospatial
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/darukaa_geospatial

# Backend Security
JWT_SECRET_KEY=darukaa_hackathon_super_secure_jwt_secret_key_2026_x92k!
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Backend Host & CORS
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

# Frontend Configuration (also set in frontend/.env)
VITE_API_BASE_URL=http://localhost:8000/api
VITE_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_public_token_here
```

---

## 13. Local Development Setup

### Prerequisites
- Docker & Docker Desktop (running)
- Python 3.12+ or 3.14
- Node.js 20+ / 24+ and npm

---

## 14. Docker & PostGIS Setup
The database runs as a containerized PostgreSQL + PostGIS service.

Start the database:
```bash
docker compose up -d db
```

Verify the container is healthy:
```bash
docker ps --filter "name=darukaa_postgis"
```

Verify PostGIS version inside the container:
```bash
docker exec darukaa_postgis psql -U postgres -d darukaa_geospatial -c "SELECT PostGIS_Full_Version();"
```

---

## 15. Database Migrations (Alembic)

Install backend dependencies:
```bash
pip install -r backend/requirements.txt
```

Apply all migrations to create tables and spatial indexes:
```bash
cd backend
python -m alembic upgrade head
cd ..
```

---

## 16. Seed & Demonstration Data

Populate the database with realistic demonstration projects, polygons, and multi-year time-series:
```bash
python database/seed/seed_data.py
```

### Pre-Configured Demo User Credentials:
| Account | Email | Password | Role | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@darukaa.earth` | `Admin@123456` | `ADMIN` | Full control: create projects, draw sites, delete, log field observations |
| **Analyst** | `analyst@darukaa.earth` | `Analyst@123456` | `USER` | Read-only analytics, interactive map exploration |

> [!NOTE]
> Demo accounts can be auto-filled with 1 click using the quick credentials buttons on the login screen.

---

## 17. Running the Backend

From the repository root or `backend/` folder:
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Base URL: `http://localhost:8000/api`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health/db`

---

## 18. Running the Frontend

Install dependencies and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 19. Automated Testing

### Backend Test Suite (Pytest)
Executes 14 automated tests covering authentication, RBAC, project CRUD, GeoJSON polygon validation, PostGIS spatial queries, and time-series analytics:
```bash
pytest backend/tests -v
```

### Frontend Typecheck & Production Build
```bash
cd frontend
npm run build
```

---

## 20. Code Quality & Formatting

### Python (Ruff)
Run fast linting and formatting checks:
```bash
# Check for linting issues
ruff check backend/

# Automatically fix linting issues
ruff check --fix backend/

# Verify formatting
ruff format --check backend/

# Format all Python files
ruff format backend/
```

### Frontend (ESLint & TypeScript)
```bash
cd frontend
npm run lint
```

---

## 21. Pre-commit Hooks
Pre-commit is configured in `.pre-commit-config.yaml` to ensure code quality on every git commit.

Install pre-commit hooks:
```bash
pre-commit install
```

Run hooks against all files:
```bash
pre-commit run --all-files
```

---

## 22. GitHub Actions CI/CD Pipeline
The repository includes automated CI in `.github/workflows/ci.yml`:
1. Launches a **PostgreSQL 16 + PostGIS 3.4** service container.
2. Installs geospatial system packages (`libgeos-dev`, `libpq-dev`).
3. Runs **Ruff linting and formatting** on Python files.
4. Executes **Alembic migrations** and seeds demonstration data.
5. Runs the full **Pytest integration test suite**.
6. Installs Node dependencies and executes **ESLint**.
7. Verifies TypeScript strict typing and compiles the **Vite production bundle**.

---

## 23. Production Deployment Guide

### Deploying the Backend (Render)
1. Create a PostgreSQL + PostGIS instance on Render or Supabase.
2. Create a **New Web Service** pointing to your repository.
3. Configure:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt && python -m alembic upgrade head`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables to add in Render:
   - `DATABASE_URL` (your production PostGIS connection string)
   - `JWT_SECRET_KEY` (secure 32+ character random string)
   - `ALLOWED_ORIGINS` (your frontend domain, e.g. `https://your-darukaa-app.vercel.app`)

### Deploying the Frontend (Vercel)
1. Import the repository into Vercel.
2. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment Variables in Vercel:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://your-backend.onrender.com/api`)
   - `VITE_MAPBOX_ACCESS_TOKEN`: Your Mapbox public access token (`pk.eyJ1...`)

---

## 24. Known Limitations
- **Single Linear Ring for Mapbox Draw**: Mapbox Draw polygon mode currently generates a single exterior linear ring. Interior holes (donut polygons) can be stored by PostGIS, but drawing multiple holes interactively requires custom tool modes.
- **Synchronous Ingestion**: Field observations are committed synchronously to PostgreSQL. For millions of high-frequency IoT sensors, an asynchronous event queue (e.g., Celery/Redis or Kafka) would be recommended.

---

## 25. Technical Trade-offs
- **psycopg 3 vs psycopg2**: We selected `psycopg` (v3) binary for native Python 3.14 compatibility, modern async streaming support, and cleaner connection pooling.
- **GeoAlchemy2 Geometry vs Geography Column**: We opted for `geometry(Polygon, 4326)` with explicit spatial GIST indexing and cast to `geography` during area queries (`ST_Area(geometry::geography)`). This gives the best of both worlds: rapid spatial indexing and planar operations, while ensuring geodetic ellipsoidal precision when calculating real hectares.

---

## 26. Future Roadmap
- [ ] Automated Sentinel-2 satellite imagery ingestion via Google Earth Engine API or Microsoft Planetary Computer.
- [ ] Geospatial overlap detection preventing conflicting site creation across overlapping concessions.
- [ ] Export verified carbon certificates as signed PDF reports with QR codes linking to PostGIS parcel records.
- [ ] Multi-tenant organization accounts with custom approval workflows for ESG auditors.

---

## License
Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
