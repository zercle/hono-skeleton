# Auth Domain

This domain handles user authentication and authorization functionality.

## Features

- User registration
- User login with JWT authentication
- Password hashing using bcrypt
- Input validation with Zod schemas

## Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and obtain JWT token

## Assumptions

- JWT secret is configured via `JWT_SECRET` environment variable
- Passwords are hashed using bcrypt with 12 rounds
- User IDs are generated using UUIDv7
- All user data is stored in a repository implementing `IUserRepository`
