# Hono.js Backend Boilerplate Template

A production-ready backend template built with **Hono.js** on the **Bun** runtime, following **Clean Architecture** principles and **SOLID** design patterns.

## 🚀 Features

- **Fast Runtime**: Built on Bun for superior performance
- **Clean Architecture**: Layered architecture with clear separation of concerns
- **Type Safety**: Full TypeScript support throughout the stack
- **Dependency Injection**: Using tsyringe for loose coupling
- **Database Integration**: Prisma ORM with SQLite (easily switchable)
- **JWT Authentication**: Ready-to-use auth system with middleware
- **Testing Setup**: Bun test runner with example tests
- **Code Quality**: ESLint + Prettier configuration
- **Docker Support**: Multi-stage Dockerfile and Docker Compose
- **API Documentation**: Structured with example domains

## 🏗️ Architecture

```
src/
├── app.ts                      # Hono app configuration
├── server.ts                   # Server startup
├── index.ts                    # Entry point
├── domain/                     # Domain models and interfaces
│   ├── entities/
│   ├── interfaces/
│   └── models/
├── repository/                 # Data access layer
│   ├── interfaces/
│   └── implementations
├── usecase/                    # Business logic layer
│   ├── interfaces/
│   └── implementations
├── handler/                    # HTTP request handlers
├── routes/                     # Route definitions
├── infrastructure/             # External concerns
│   ├── config/
│   ├── database/
│   ├── middleware/
│   └── container/             # DI container
└── tests/                     # Test files
```

## 🔧 Quick Start

### Prerequisites

- [Bun runtime](https://bun.sh) installed
- Docker (optional, for containerized development)

### Installation

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize database**
   ```bash
   bun prisma generate
   bun prisma migrate dev
   ```

4. **Start development server**
   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun test` | Run test suite |
| `bun test:watch` | Run tests in watch mode |
| `bun run lint` | Check code style with ESLint |
| `bun run format` | Format code with Prettier |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run docker:build` | Build Docker image |
| `bun run docker:up` | Start with Docker Compose |

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)

### Greeting (Example Domain)
- `GET /greeting` - Get greeting message
- `POST /greeting` - Create new greeting

### Posts (Example Domain)
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get post by ID
- `GET /posts/author/:authorId` - Get posts by author
- `POST /posts` - Create post (protected)
- `PUT /posts/:id` - Update post (protected)
- `DELETE /posts/:id` - Delete post (protected)

## 🏛️ Adding New Domains

Follow these steps to add a new domain:

1. **Define Domain Model** (`src/domain/models/`)
2. **Create Repository Interface** (`src/repository/interfaces/`)
3. **Implement Repository** (`src/repository/`)
4. **Create Use Case Interface** (`src/usecase/interfaces/`)
5. **Implement Use Case** (`src/usecase/`)
6. **Create Handler** (`src/handler/`)
7. **Define Routes** (`src/routes/`)
8. **Register in DI Container** (`src/infrastructure/container/`)
9. **Add Routes to App** (`src/routes/index.ts`)

## 🐳 Docker Development

### Using Docker Compose (Recommended)
```bash
bun run docker:up      # Start all services
bun run docker:logs    # View logs
bun run docker:down    # Stop all services
```

### Building Docker Image
```bash
bun run docker:build
bun run docker:run
```

## 🧪 Testing

Run the test suite:
```bash
bun test
```

Tests are organized by domain and include:
- Unit tests for repositories and use cases
- Integration tests for API endpoints
- Handler tests for HTTP logic

## 📄 Environment Variables

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
DATABASE_URL="file:./dev.db"
```

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Framework**: Hono.js
- **Language**: TypeScript
- **Database**: Prisma ORM (SQLite default)
- **DI Container**: tsyringe
- **Authentication**: jsonwebtoken
- **Testing**: Bun test runner
- **Code Quality**: ESLint + Prettier
- **Containerization**: Docker

## 📚 Documentation

- [Bun Documentation](https://bun.sh/docs)
- [Hono.js Documentation](https://hono.dev/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by Zercle Technology Co., Ltd.**
