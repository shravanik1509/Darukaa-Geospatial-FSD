# Darukaa.Earth Database & PostGIS Documentation

## 1. Database Engine & Spatial Capabilities
The platform uses **PostgreSQL 16** with the **PostGIS 3.4** spatial extension.
- Coordinate Reference System: **WGS84 (EPSG:4326 / SRID 4326)**
- Spatial Types: `geometry(POLYGON, 4326)` with automatic **GIST (Generalized Search Tree)** spatial indexing (`idx_sites_geometry`).
- Geodesic Computations: True ellipsoidal surface area is calculated dynamically using PostGIS `ST_Area(geometry::geography) / 10000.0` to yield accurate hectares regardless of latitude distortion.
- Centroids are computed using `ST_Centroid(geometry)` and exposed for Mapbox camera framing.

---

## 2. Docker Setup
To start the database:
```bash
docker compose up -d db
```
Data is persistently stored in the named Docker volume `postgis_data`.

---

## 3. Database Migrations (Alembic)
Apply all pending schema migrations:
```bash
cd backend
python -m alembic upgrade head
```

Rollback a migration:
```bash
python -m alembic downgrade -1
```

---

## 4. Seeding Demonstration Data
To populate the database with realistic global conservation projects, valid WGS84 polygon sites, and multi-year time-series environmental measurements:
```bash
python database/seed/seed_data.py
```

### Demonstration User Accounts
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@darukaa.earth` | `Admin@123456` | Full administrative control, create projects, draw sites, delete |
| **Analyst** | `analyst@darukaa.earth` | `Analyst@123456` | View projects, explore maps, analyze time-series curves |

> [!NOTE]
> All seed records are synthetic demonstration data created specifically for the hackathon evaluation to showcase multi-year ecological performance curves.
