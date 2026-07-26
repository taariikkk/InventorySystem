# 📦 Inventory & Order Management System

> A professional, full-stack, enterprise-grade system for managing inventory and sales orders — featuring real-time data visualization, automatic database seeding, and secure role-based access control.

This project applies modern software patterns and architectural standards across both the backend and frontend — no generic To-Do lists here. It implements complex, real-world business logic: transactional inventory safety (ACID), multi-stage Docker containerization, client-side routing redirects, and role-based interface protection.

![.NET](https://img.shields.io/badge/.NET_8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## 🔗 Live Deployments

- **Frontend App (Vercel):** [inventory-system-six-iota.vercel.app](https://inventory-system-six-iota.vercel.app)
- **Backend API (Render):** [inventorysystem-no7u.onrender.com](https://inventorysystem-no7u.onrender.com)
- **Database (Supabase):** Managed cloud PostgreSQL instance

> ☁️ **Azure deployment planned** — a migration of the API to Azure App Service and the frontend to Azure Static Web Apps is planned as a next step, alongside a CI/CD pipeline via GitHub Actions.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture (Clean Architecture)](#-architecture-clean-architecture)
- [Database Seeding & Demo Credentials](#-database-seeding-and-demo-credentials)
- [Getting Started Locally](#-getting-started-locally)
- [Repository Structure](#-repository-structure)

---

## ✨ Key Features

- 📊 **Interactive Sales Dashboard** — Real-time metrics cards, a top-5 best-selling products list, and an interactive monthly revenue chart rendered via **Recharts**.
- 🔐 **Secure Role-Based Access Control (RBAC)** — User authorization levels (`Admin`, `Manager`, `Worker`) mapped through custom JWT claims on the backend, with corresponding conditional UI rendering on the frontend.
- 📦 **Transactional Order Processing** — Full ACID safety using explicit database transactions (`IDbContextTransaction`) during order placement. Stock quantities are reduced dynamically, with the entire process rolled back if inventory is insufficient.
- 🗑 **Audit Trail & Soft Delete** — Physical deletion is prevented for critical records. Products use a global EF Core query filter to implement logical deletion while preserving historical relational integrity.
- 🔍 **Optimized Server-Side Queries** — High-performance search, multi-parameter price filtering, and pagination handled natively inside PostgreSQL using deferred LINQ execution (`IQueryable`).
- 🔄 **Automatic Database Seeding** — A startup seeder ensures any fresh deployment instantly has active users, inventory products, and structured historical orders spanning the last 6 months.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | .NET 8 Web API, Entity Framework Core, C# |
| **Database** | PostgreSQL (Supabase Cloud in production / Docker locally) |
| **Authentication** | JWT (JSON Web Tokens), BCrypt for secure password hashing |
| **Frontend** | React (Vite + TypeScript), Axios, TailwindCSS, React Hook Form + Zod, Recharts, Lucide Icons |
| **DevOps & Cloud** | Multi-stage Dockerfile, Vercel SPA redirects, Render containers, Supabase Pooler, Azure *(planned)* |

---

## 🏗 Architecture (Clean Architecture)

The project strictly adheres to **Clean Architecture** and the **Dependency Inversion Principle (DIP)**. Business rules and domain logic remain independent of database engines, UI frameworks, or external NuGet packages:

```
Domain  ←  Application  ←  Infrastructure
              ↑                  ↑
              └──────── WebAPI ──┘
```

| Project | Responsibility |
|---|---|
| **`InventorySystem.Domain`** | Core POCO entities (`Product`, `Order`, `OrderItem`, `User`), enums, and domain logic encapsulated within rich model methods (e.g., `ReduceStock`). |
| **`InventorySystem.Application`** | Abstract service contracts (interfaces), request/response DTOs, and application use cases (e.g., `AuthService`, `ProductService`, `OrderService`). |
| **`InventorySystem.Infrastructure`** | Persistence layer containing `ApplicationDbContext`, Fluent API schemas, database migrations, password hashing (BCrypt), and JWT token generation. |
| **`InventorySystem.WebAPI`** | API controllers, custom global exception handling, JWT Bearer validation middleware, CORS policies, and dependency injection registration. |

---

## 👥 Database Seeding and Demo Credentials

For demo and testing purposes, the database is automatically seeded with three pre-configured accounts on startup.

*Public self-registration is disabled on the frontend to reflect real-world enterprise security standards, where only Administrators are authorized to provision new team accounts.*

| Email | Password | Role | Permissions |
|---|---|---|---|
| `admin@test.com` | `password123` | **Admin** | Full system rights: manage users, products, orders, and view dashboard analytics. |
| `manager@test.com` | `password123` | **Manager** | Inventory rights: add/update/delete products, place orders, and view analytics. |
| `worker@test.com` | `password123` | **Worker** | Operations rights: view inventory list, place sales orders, and view dashboard *(read-only for products)*. |

---

## 🚀 Getting Started Locally

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js 18+](https://nodejs.org/)

### 1. Clone the repository

```bash
git clone https://github.com/taariikkk/InventorySystem.git
cd InventorySystem
```

### 2. Run the PostgreSQL database in Docker

```bash
docker compose up -d
```

### 3. Set up and run the backend

```bash
cd server

# Apply migrations to the local database
dotnet ef database update --project InventorySystem.Infrastructure --startup-project InventorySystem.WebAPI

# Run the API with hot-reload enabled
dotnet watch --project InventorySystem.WebAPI
```

The Swagger UI will be available at `http://localhost:5153/swagger`.

### 4. Set up and run the frontend

Open a new terminal tab:

```bash
cd client

# Install dependencies
npm install

# Run the client in development mode
npm run dev
```

The React app will be live at `http://localhost:5173`.

---

## 📁 Repository Structure

```
inventory-management/
├── server/                                  # ── BACKEND (ASP.NET Core Web API)
│   ├── InventorySystem.sln                  # Centralni solution fajl
│   ├── Dockerfile                           # Multi-stage Dockerfile za produkcijski Render build
│   │
│   ├── InventorySystem.Domain/              # 1. DOMENSKI SLOJ (Domain Layer)
│   │   ├── InventorySystem.Domain.csproj
│   │   ├── Common/
│   │   │   └── BaseEntity.cs                # Bazni entitet sa Id-em i Soft Delete poljem
│   │   └── Entities/
│   │       ├── Product.cs                   # Proizvod sa bogatom domenskom logikom zaliha
│   │       ├── Order.cs                     # Narudžba
│   │       ├── OrderItem.cs                 # Stavka narudžbe sa istorijskom cijenom
│   │       └── User.cs                      # Korisnički entitet i UserRole enum
│   │
│   ├── InventorySystem.Application/         # 2. APLIKACIJSKI SLOJ (Application Layer)
│   │   ├── InventorySystem.Application.csproj
│   │   ├── Interfaces/                      # Ugovori/Interfejsi za servise
│   │   │   ├── IPasswordHasher.cs
│   │   │   ├── ITokenGenerator.cs
│   │   │   ├── IAuthService.cs
│   │   │   ├── IProductService.cs
│   │   │   ├── IOrderService.cs
│   │   │   └── IDashboardService.cs
│   │   ├── DTOs/                            # Podaci za komunikaciju sa klijentom
│   │   │   ├── RegisterRequest.cs
│   │   │   ├── LoginRequest.cs
│   │   │   ├── AuthResponse.cs
│   │   │   ├── ProductRequest.cs
│   │   │   ├── ProductResponse.cs
│   │   │   ├── PagedResponse.cs
│   │   │   ├── OrderRequest.cs
│   │   │   ├── OrderResponse.cs
│   │   │   ├── OrderItemRequest.cs
│   │   │   ├── OrderItemResponse.cs
│   │   │   ├── CreateUserRequest.cs
│   │   │   ├── UserResponse.cs
│   │   │   ├── TopProductResponse.cs
│   │   │   ├── MonthlyRevenueResponse.cs
│   │   │   └── DashboardSummaryResponse.cs
│   │   └── Services/                        # Aplikativna biznis logika
│   │       ├── AuthService.cs
│   │       ├── ProductService.cs
│   │       ├── OrderService.cs
│   │       └── DashboardService.cs
│   │
│   ├── InventorySystem.Infrastructure/      # 3. INFRASTRUKTURNI SLOJ (Infrastructure Layer)
│   │   ├── InventorySystem.Infrastructure.csproj
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs       # DbContext sa Fluent API-jem i Query Filterima
│   │   │   └── DatabaseSeeder.cs            # Automatsko punjenje baze pri startu
│   │   ├── Services/                        # Implementacije eksternih servisa
│   │   │   ├── PasswordHasher.cs            # BCrypt implementacija hashiranja
│   │   │   └── TokenGenerator.cs            # Generisanje JWT Bearer tokena
│   │   └── Migrations/                      # Auto-generisane EF Core migracije baze
│   │
│   └── InventorySystem.WebAPI/              # 4. WEBAPI SLOJ (Presentation Layer)
│       ├── InventorySystem.WebAPI.csproj
│       ├── Program.cs                       # Registracija servisa, middleware-a i CORS-a
│       ├── appsettings.json                 # Glavni konfiguracioni fajl baze
│       ├── appsettings.Development.json
│       └── Controllers/                     # API Endpoints
│           ├── AuthController.cs            # Register i Login rute
│           ├── ProductsController.cs        # CRUD i paginacija za proizvode (RBAC)
│           ├── OrdersController.cs          # Kreiranje i pregled narudžbi
│           ├── UsersController.cs           # Admin-only upravljanje korisnicima
│           └── DashboardController.cs       # Analitika i grafikoni za Dashboard
│
├── client/                                  # ── FRONTEND (React + Vite + TypeScript)
│   ├── index.html                           # Ulazna HTML stranica
│   ├── tailwind.config.js                   # Konfiguracija Tailwind CSS skeniranja
│   ├── postcss.config.js
│   ├── tsconfig.json                        # TypeScript konfiguracija
│   ├── vercel.json                          # Rewrites pravila za React Router na Vercelu
│   ├── .env.development                     # Lokalna adresa backenda (localhost)
│   ├── .env.production                      # Produkcijska adresa backenda (Render)
│   └── src/
│       ├── main.tsx                         # Pokretanje React aplikacije
│       ├── App.tsx                          # Glavno stablo ruter navigacije i provajdera
│       ├── index.css                        # Globalni CSS sa Tailwind direktivama
│       │
│       ├── types/
│       │   └── index.ts                     # TypeScript tipovi koji preslikavaju DTO-ove
│       │
│       ├── services/
│       │   └── api.ts                       # Axios klijent sa JWT Request Interceptorom
│       │
│       ├── context/
│       │   ├── AuthContext.ts               # Kreiranje i interfejs za AuthContext
│       │   └── AuthProvider.tsx             # Provider sa Lazy State Initialization logikom
│       │
│       ├── hooks/
│       │   └── useAuth.ts                   # Custom hook za brzu upotrebu AuthContext-a
│       │
│       ├── components/                      # Zajedničke i zaštitne UI komponente
│       │   ├── ProtectedRoute.tsx           # Čuvar ruta (zahtijeva ispravan token)
│       │   └── Layout.tsx                   # Glavni raspored (Meni, Sidebar i Logout)
│       │
│       └── pages/                           # Glavne ekranske stranice
│           ├── Login.tsx                    # Login forma (React Hook Form + Zod)
│           ├── Dashboard.tsx                # Metrike, Recharts grafikoni i Top lista
│           ├── Products.tsx                 # CRUD, pretraga, paginacija i Modali (RBAC)
│           ├── Orders.tsx                   # Narudžbe i korpa za kupovinu (Order Builder)
│           └── Users.tsx                    # Admin-only pregled i dodavanje članova tima
│
├── docker-compose.yml                       # Lokalni PostgreSQL Docker kontejner
└── .gitignore                               # Profesionalno izuzimanje bin/node_modules/env
```

---

## 📄 License

This project was developed for educational purposes as a full-stack portfolio showcase.
