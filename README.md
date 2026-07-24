# 📦 Inventory & Order Management System

> A multi-tenant system for managing inventory and orders, featuring advanced analytics and role-based access control.

This project is designed to apply modern software patterns and architectural standards on both the backend and frontend — no generic To-Do lists here. The focus is on real business logic: transactional inventory management, role-based access, and real-time analytics.

![.NET](https://img.shields.io/badge/.NET_8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture-clean-architecture)
- [Key Features](#-key-features)
- [Current Status](#-current-project-status)
- [Getting Started](#-getting-started-locally)
- [Repository Structure](#-repository-structure)
- [Roadmap](#-roadmap)

---

## 🎯 About the Project

InventorySystem allows companies (tenants) to manage their products, stock, and orders through a single system, with complete data isolation between different tenants. The system includes a sales analytics dashboard, role-based authentication (Admin/Manager/Worker), and business rules implemented directly within the domain layer (rich domain model).

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | .NET 8 Web API, Entity Framework Core (Code-First), C# |
| **Database** | PostgreSQL (Dockerized for local development) |
| **Authentication** | JWT (JSON Web Tokens), BCrypt for password hashing |
| **Frontend** | React (Vite + TypeScript), TailwindCSS, TanStack Query, React Hook Form + Zod *(planned)* |
| **Data Visualization** | Recharts *(planned)* |
| **DevOps & Cloud** | Docker Compose, GitHub Actions (CI/CD), Azure *(planned)* |

## 🏗 Architecture (Clean Architecture)

The project follows Clean Architecture principles to ensure the business logic stays independent of external libraries, the database, and the UI layer. Dependencies flow strictly inward:

```
Domain  ←  Application  ←  Infrastructure
              ↑                  ↑
              └──────── WebAPI ──┘
```

| Layer | Responsibility |
|---|---|
| **`InventorySystem.Domain`** | Core entities, enums, and domain rules — pure C# with no external dependencies |
| **`InventorySystem.Application`** | Interfaces, DTOs, and use cases (business orchestration) |
| **`InventorySystem.Infrastructure`** | Database implementation (`DbContext`), repositories, authentication, and external services |
| **`InventorySystem.WebAPI`** | Application entry point — controllers, middleware, DI configuration |

## ✨ Key Features

- 📊 **Dashboard analytics** — top 5 best-selling products, monthly revenue chart
- 🔐 **JWT authentication** with role-based access (Admin, Manager, Worker)
- 🏢 **Multi-tenant architecture** — complete data isolation between companies
- 📦 **Inventory management** — transactional stock reduction on order creation
- 🗑 **Soft Delete** for products — logical, not physical, deletion
- 🔍 **Advanced filtering and pagination** on the backend

---

## 📈 Current Project Status

### ✅ Done

- [x] Initialized Clean Architecture solution structure with correctly configured project references
- [x] Defined core domain entities: `Product`, `Order`, `OrderItem`, `ApplicationUser`
- [x] Configured a PostgreSQL container via Docker Compose
- [x] Set up `ApplicationDbContext` with Fluent API configurations:
  - Unique index on the `SKU` field
  - Configured decimal precision for prices and amounts
  - Implemented a **Global Query Filter** for Soft Delete
- [x] Created and successfully applied initial EF Core migrations
- [x] Password hashing service (`BCrypt.Net-Next`)
- [x] JWT token generator with role-based claims

### 🔜 Remaining Work

- [ ] Dependency Injection registration in `Program.cs`
- [ ] Authentication API endpoints (Register, Login)
- [ ] CRUD services for products and orders with transactional logic
- [ ] Advanced LINQ queries for dashboard analytics
- [ ] React frontend (AuthContext, tables, forms, Recharts charts)
- [ ] Automatic demo data seeding
- [ ] Azure deployment + CI/CD pipeline (GitHub Actions)

---

## 🚀 Getting Started Locally

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Docker and Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js 18+](https://nodejs.org/) *(for the frontend, once ready)*

### 1. Clone the repository

```bash
git clone https://github.com/taariikkk/inventory-management.git
cd inventory-management
```

### 2. Start the PostgreSQL database in Docker

```bash
docker compose up -d
```

### 3. Apply EF Core migrations

```bash
dotnet ef database update \
  --project server/src/InventorySystem.Infrastructure \
  --startup-project server/src/InventorySystem.WebAPI
```

### 4. Run the backend

```bash
dotnet watch --project server/src/InventorySystem.WebAPI
```

The API will be available at `https://localhost:5001` (or the port specified in `launchSettings.json`), with Swagger documentation at `/swagger`.

### 5. Run the frontend *(once implemented)*

```bash
cd client
npm install
npm run dev
```

---

## 📁 Repository Structure

```
inventory-management/
├── server/                  ← .NET backend (Clean Architecture)
│   ├── InventorySystem.sln
│   └── src/
│       ├── InventorySystem.Domain/
│       ├── InventorySystem.Application/
│       ├── InventorySystem.Infrastructure/
│       └── InventorySystem.WebAPI/
├── client/                  ← React (Vite + TypeScript) frontend
├── docker-compose.yml       ← PostgreSQL container for local development
└── README.md
```

---

## 🗺 Roadmap

| Phase | Content | Status |
|---|---|---|
| **Days 1-5** | Backend: .NET, EF Core, PostgreSQL, JWT, LINQ analytics | 🔄 In progress |
| **Days 6-10** | Frontend: React setup, AuthContext, React Query tables, dashboard charts | ⏳ Planned |
| **Days 11-14** | Polishing, seed data, CI/CD, Azure deployment | ⏳ Planned |

---

## 📄 License

This project was developed for educational purposes as a portfolio project.