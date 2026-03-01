# Lets Go Colombo Tours - Complete Architecture Diagram

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GITHUB REPOSITORY (Main Branch)                      │
│  https://github.com/janithasulakshana/Website.git                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────┐  ┌──────────────────────┐                     │
│  │  Source Code            │  │  GitHub Actions CI/CD │                     │
│  │  - Backend (Node.js)    │  │  ┌─────────────────┐ │                     │
│  │  - Frontend (React)     │◄─┤→ build.yml        │ │                     │
│  │  - Config Files         │  │  - Lint & Build   │ │                     │
│  │  - Kubernetes Manifests │  │  - Docker Build   │ │                     │
│  └─────────────────────────┘  │  ┌─────────────────┐ │                     │
│                                │→ deploy.yml       │ │                     │
│                                │  - Push to Docker │ │                     │
│                                │  - Update Registry│ │                     │
│                                └──────────────────────┘                     │
│                                          │                                  │
└──────────────────────────────────────────┼──────────────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
        ┌─────────────────────┐ ┌──────────────────────┐ ┌──────────────┐
        │   Docker Images     │ │  Docker Registry     │ │   Git Flow   │
        │                     │ │  (Docker Hub)        │ │              │
        │ - Backend Image     │ │                      │ │ - main       │
        │ - Frontend Image    │ │ - yourusername/      │ │ - develop    │
        │                     │ │   website-backend    │ │ - features/* │
        │ Built locally:      │ │ - yourusername/      │ │              │
        │ website-backend     │ │   website-frontend   │ └──────────────┘
        │ website-frontend    │ └──────────────────────┘
        └─────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────────────────┐
    │     DOCKER DESKTOP (Local Development)            │
    │                                                   │
    │  ┌─────────────────────────────────────────────┐ │
    │  │         Kubernetes Cluster                  │ │
    │  │  (Single Node - docker-desktop)             │ │
    │  │                                             │ │
    │  │  ┌─────────────────────────────────────────┤ │
    │  │  │  ArgoCD Namespace                       │ │
    │  │  │  ┌─────────────────────────────────────┤ │
    │  │  │  │ • argocd-server (UI)                │ │
    │  │  │  │ • argocd-application-controller     │ │
    │  │  │  │ • argocd-repo-server                │ │
    │  │  │  │ • argocd-redis                      │ │
    │  │  │  │ • argocd-dex-server (Auth)          │ │
    │  │  │  │ • Application: letsgo-app-local     │ │
    │  │  │  │   - Syncs from GitHub repo          │ │
    │  │  │  │   - Auto-deploys manifests          │ │
    │  │  │  └─────────────────────────────────────┤ │
    │  │  │                                         │ │
    │  │  │  ┌─────────────────────────────────────┤ │
    │  │  │  │  Default Namespace                  │ │
    │  │  │  │  ┌──────────────────────────────────┤ │
    │  │  │  │  │ Pod: website-pod (2/2)           │ │
    │  │  │  │  │ ┌──────────────────────────────┤ │
    │  │  │  │  │ │ Container: backend           │ │
    │  │  │  │  │ │ - Image: website-backend     │ │
    │  │  │  │  │ │ - Port: 5000                 │ │
    │  │  │  │  │ │ - Env: NODE_ENV=production   │ │
    │  │  │  │  │ │ - Volume: /data (SQLite DB)  │ │
    │  │  │  │  │ └──────────────────────────────┤ │
    │  │  │  │  │ ┌──────────────────────────────┤ │
    │  │  │  │  │ │ Container: frontend          │ │
    │  │  │  │  │ │ - Image: website-frontend    │ │
    │  │  │  │  │ │ - Port: 5173                 │ │
    │  │  │  │  │ │ - Env: VITE_API_BASE_URL     │ │
    │  │  │  │  │ └──────────────────────────────┤ │
    │  │  │  │  └──────────────────────────────────┤ │
    │  │  │  │  Persistent Storage:                │ │
    │  │  │  │  - emptyDir: {} (pod-scoped)       │ │
    │  │  │  └─────────────────────────────────────┤ │
    │  │  │                                         │ │
    │  │  └─────────────────────────────────────────┘ │
    │  │                                              │
    │  └──────────────────────────────────────────────┘ │
    │                                                   │
    │  ┌─────────────────────────────────────────────┐ │
    │  │    Docker Runtime (Container Engine)        │ │
    │  │    - Manages pods and containers            │ │
    │  │    - Image repository (local)               │ │
    │  └─────────────────────────────────────────────┘ │
    │                                                   │
    └───────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌──────┐   ┌─────────┐  ┌────────┐
    │Lens  │   │kubectl  │  │Docker  │
    │IDE   │   │CLI      │  │Desktop │
    │      │   │         │  │UI      │
    └──────┘   └─────────┘  └────────┘
        ▲           ▲           ▲
        │           │           │
        └───────────┼───────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
    ┌──────────────┐  ┌──────────────┐
    │http://       │  │https://      │
    │localhost:    │  │localhost:    │
    │5000 (Backend)│  │8888 (ArgoCD) │
    │API Endpoints │  │              │
    │              │  │ UI Dashboard │
    │5173 (Frontend)│  │(port-fwd)    │
    └──────────────┘  └──────────────┘
```

---

## Detailed Component Breakdown

### 1. **Source Code Layer (GitHub)**
```
GitHub Repository: janithasulakshana/Website
├── Backend (Node.js + Express)
│   ├── server.js
│   ├── config/constants.js
│   ├── package.json (dependencies)
│   └── seed.js (database seeding)
│
├── Frontend (React + Vite)
│   ├── src/App.jsx
│   ├── src/pages/*.jsx
│   ├── vite.config.js
│   └── package.json
│
├── Docker & Kubernetes
│   ├── Dockerfile (backend)
│   ├── Dockerfile.frontend
│   ├── docker-compose.yml
│   ├── pod.yaml
│   └── argocd-local-app.yaml
│
└── CI/CD Workflows (.github/workflows/)
    ├── build.yml
    └── deploy.yml
```

### 2. **CI/CD Pipeline (GitHub Actions)**
```
Trigger: git push to main branch
│
├─ Job 1: build.yml
│  ├─ Backend Build
│  │  ├─ npm ci
│  │  └─ npm install
│  │
│  ├─ Frontend Build
│  │  ├─ npm ci
│  │  ├─ npm run build
│  │  └─ npm run lint
│  │
│  └─ Docker Build Validation
│     ├─ Build backend image
│     └─ Build frontend image
│
└─ Job 2: deploy.yml (runs after build succeeds)
   ├─ Docker Hub Login
   ├─ Build & Push Backend Image
   │  └─ yourusername/website-backend:latest
   │     yourusername/website-backend:<short-sha>
   │
   └─ Build & Push Frontend Image
      └─ yourusername/website-frontend:latest
         yourusername/website-frontend:<short-sha>
```

### 3. **Kubernetes Architecture (Docker Desktop)**
```
┌─────────────────────────────────────────┐
│  Docker Desktop Kubernetes Cluster      │
│  (Single Node Cluster)                  │
├─────────────────────────────────────────┤
│                                         │
│  Namespace: argocd                      │
│  ├─ Services                            │
│  │  └─ argocd-server (ClusterIP)        │
│  ├─ Deployments                         │
│  │  ├─ argocd-server                    │
│  │  ├─ argocd-repo-server               │
│  │  ├─ argocd-application-controller    │
│  │  ├─ argocd-dex-server                │
│  │  └─ argocd-notifications-controller  │
│  ├─ StatefulSets                        │
│  │  └─ argocd-application-controller    │
│  └─ Custom Resources                    │
│     └─ Application: letsgo-app-local    │
│        ├─ source.repoURL: GitHub        │
│        ├─ source.path: .                │
│        ├─ destination.namespace: default│
│        └─ syncPolicy: automated         │
│                                         │
│  Namespace: default                     │
│  ├─ Pods                                │
│  │  └─ website-pod (2/2 Running)        │
│  │     ├─ Container: backend            │
│  │     │  ├─ Image: website-backend     │
│  │     │  ├─ Port: 5000/TCP             │
│  │     │  ├─ Env: NODE_ENV, JWT_SECRET │
│  │     │  └─ VolumeMounts: /data        │
│  │     │                                │
│  │     └─ Container: frontend           │
│  │        ├─ Image: website-frontend    │
│  │        ├─ Port: 5173/TCP             │
│  │        └─ Env: VITE_API_BASE_URL     │
│  │                                      │
│  ├─ Volumes                             │
│  │  └─ emptyDir (pod-scoped storage)    │
│  │     └─ /data/bookings.db (SQLite)    │
│  │                                      │
│  └─ Services (Internal)                 │
│     └─ Implicit ClusterIP for pod       │
│                                         │
└─────────────────────────────────────────┘
```

### 4. **Port Forwarding & Access**
```
Local Machine
├─ kubectl port-forward pod/website-pod 5000:5000
│  └─ http://localhost:5000
│     └─ Backend API (Express Server)
│        ├─ GET /api/tours
│        ├─ POST /api/bookings
│        ├─ GET /api/test
│        └─ ... other endpoints
│
├─ kubectl port-forward pod/website-pod 5173:5173
│  └─ http://localhost:5173
│     └─ Frontend (React + Vite Dev Server)
│        ├─ /
│        ├─ /tours
│        ├─ /bookings
│        └─ /admin
│
└─ kubectl port-forward svc/argocd-server -n argocd 8888:443
   └─ https://localhost:8888
      └─ ArgoCD UI
         ├─ Dashboard
         ├─ Applications
         ├─ Logs
         └─ Settings
```

### 5. **Data Flow**
```
User Browser
│
├─ Frontend Request (React)
│  └─ http://localhost:5173
│     └─ Page loads
│        └─ Makes API calls to backend
│
├─ Backend Request (Node.js + Express)
│  └─ http://localhost:5000
│     └─ Processes request
│        └─ Queries SQLite Database
│           └─ /data/bookings.db
│              └─ Returns response
│
└─ Response back to Browser
   └─ Frontend renders data
      └─ User sees bookings/tours
```

### 6. **Deployment Flow (ArgoCD)**
```
GitHub Push
    │
    ▼
GitHub Actions (build.yml)
    │ (if success)
    ▼
GitHub Actions (deploy.yml)
    │
    ├─ Build Docker Images
    └─ Push to Docker Hub
           │
           ▼
ArgoCD Application (letsgo-app-local)
    │
    ├─ Syncs GitHub repo
    ├─ Detects manifest changes
    └─ Auto-deploys to Kubernetes
           │
           ▼
Docker Desktop Kubernetes
    │
    ├─ Updates pod image
    └─ Restarts containers
           │
           ▼
New version live on localhost:5173
```

---

## Technology Stack Summary

| Layer | Technology | Component |
|-------|-----------|-----------|
| **Version Control** | Git/GitHub | Repository, Branches |
| **CI/CD** | GitHub Actions | build.yml, deploy.yml |
| **Container Registry** | Docker Hub | Image storage |
| **Container Runtime** | Docker | Local container execution |
| **Orchestration** | Kubernetes | Pod/Service management |
| **GitOps** | ArgoCD | Automated deployments |
| **Backend** | Node.js + Express | API Server (Port 5000) |
| **Frontend** | React + Vite | Web App (Port 5173) |
| **Database** | SQLite | bookings.db |
| **IDE/Monitoring** | Lens | Kubernetes visualization |
| **CLI** | kubectl | Kubernetes management |

---

## Key Features

✅ **Fully Containerized** - Both frontend and backend in Docker images
✅ **Kubernetes-Ready** - Pod manifest for orchestration
✅ **GitOps Automation** - ArgoCD syncs GitHub to Kubernetes
✅ **CI/CD Pipeline** - Automated build and deploy
✅ **Local Development** - Complete setup on Docker Desktop
✅ **Port Forwarding** - Easy access to services
✅ **Persistent Storage** - SQLite database volume
✅ **Multi-Container Pod** - Backend + Frontend in single pod
✅ **Auto-Sync** - ArgoCD automatically deploys changes

---

## Quick Access Endpoints

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **ArgoCD Dashboard**: https://localhost:8888 (admin/password)
- **Kubernetes**: kubectl (docker-desktop context)

