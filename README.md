# Project Tracker - Backend

This is the **backend** for the Project Tracker application built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL**.  
It provides RESTful APIs for user authentication, project management, and analytics.  

---

## Features

- User authentication (signup, login) using JWT
- Secure password hashing with bcrypt
- CRUD operations for projects
- Project status tracking (active, completed)
- Role-based or user-specific data access
- Input validation with **Zod**
- Centralized error handling
- PostgreSQL database integration via **Prisma**
- Rate limiting for security

---

## Technologies Used

- **Node.js** with **TypeScript**
- **Express** for REST APIs
- **Prisma** as ORM for PostgreSQL
- **PostgreSQL** database
- **Zod** for request validation
- **bcrypt** for password hashing
- **jsonwebtoken** for authentication
- **cors**, **morgan**, **express-rate-limit** for middleware
- **dotenv** for environment variables

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm or yarn
- [PostgreSQL](https://www.postgresql.org/) running locally or remotely

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/project-tracker-backend.git
cd project-tracker-backend
