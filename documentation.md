# World Rudraksha Backend Documentation

This document provides detailed information about the World Rudraksha backend application, covering its architecture, modules, API endpoints, database schema, and guidelines for development and contribution.

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Architecture](#architecture)
3.  [Modules Breakdown](#modules-breakdown)
    *   [Auth Module](#auth-module)
    *   [Categories Module](#categories-module)
    *   [Subcategories Module](#subcategories-module)
    *   [Attributes Module](#attributes-module)
    *   [Products Module](#products-module)
    *   [S3 Module](#s3-module)
    *   [Prisma Module](#prisma-module)
4.  [API Endpoints and Swagger](#api-endpoints-and-swagger)
5.  [Error Handling](#error-handling)
6.  [Logging](#logging)
7.  [Security Considerations](#security-considerations)
8.  [Database Schema](#database-schema)
9.  [Contribution Guidelines](#contribution-guidelines)
10. [Testing](#testing)
11. [Deployment](#deployment)

## 1. Project Overview

The World Rudraksha backend is a robust and scalable e-commerce API built with NestJS. It serves as the core for managing all aspects of the online store, including user authentication, product catalog management, category and subcategory organization, product attributes, and integration with AWS S3 for media storage. The application is designed to be highly modular, maintainable, and extensible.

## 2. Architecture

The application is built using the **NestJS** framework, which follows a modular and highly organized structure, heavily leveraging object-oriented programming (OOP), functional programming (FP), and reactive programming (RxJS) paradigms. Key architectural decisions include:

*   **Modular Design**: The application is divided into distinct modules (e.g., `AuthModule`, `ProductsModule`), each encapsulating related functionalities, controllers, services, and entities. This promotes separation of concerns and improves maintainability.
*   **Dependency Injection**: NestJS's powerful dependency injection system is utilized throughout the application for managing dependencies. This makes components loosely coupled, easier to test, and more flexible.
*   **Prisma ORM**: **Prisma** is used as the Object-Relational Mapper (ORM) for interacting with the PostgreSQL database. It provides a type-safe and efficient way to perform database operations, generating a client that is tailored to your database schema.
*   **RESTful APIs**: All interactions with the frontend are exposed via RESTful API endpoints, adhering to standard HTTP methods (GET, POST, PUT, DELETE) and status codes.
*   **Authentication**: JWT (JSON Web Tokens) are used for secure authentication and authorization. Access tokens are short-lived, and refresh tokens are used to obtain new access tokens without re-authenticating.
*   **File Storage**: AWS S3 is integrated for scalable and reliable storage of product images and other media, allowing for efficient handling of static assets.
*   **Validation**: `class-validator` and `class-transformer` are used for robust request payload validation, ensuring data integrity and consistency.

## 3. Modules Breakdown

Each module in the `src` directory is responsible for a specific domain or feature. A typical module consists of:

*   **`*.controller.ts`**: Handles incoming requests and returns responses. It defines the API endpoints and routes.
*   **`*.service.ts`**: Contains the business logic and interacts with the database (via Prisma) or other external services.
*   **`*.module.ts`**: Organizes controllers, providers (services), and imports other modules.
*   **`dto/`**: Contains Data Transfer Objects (DTOs) for defining the structure of request and response payloads, used with `class-validator` for validation.
*   **`entities/`**: Defines the structure of the data models, often mirroring the database schema.

### Auth Module

*   **Purpose**: Manages user authentication and authorization processes, including user registration, login, token generation, and protecting routes.
*   **Key Components**:
    *   `AuthController`: Exposes endpoints for `/auth/signup`, `/auth/login`, `/auth/refresh`, etc.
    *   `AuthService`: Implements user creation, password hashing (using `argon2`), JWT token generation, and validation logic.
    *   `JwtStrategy`, `LocalStrategy`, `RefreshTokenStrategy`: Passport strategies for handling different authentication flows based on JWT and local credentials.
    *   `Guards`: Implement authentication and role-based authorization (`JwtAuthGuard`, `LocalAuthGuard`, `RefreshAuthGuard`, `RolesGuard`).
    *   `DTOs`: `SignupDto`, `LoginDto`, etc., define the structure of authentication requests.

### Categories Module

*   **Purpose**: Manages product categories, allowing for their creation, retrieval, updating, and deletion. Categories are a fundamental part of product organization.
*   **Key Components**:
    *   `CategoriesController`: Defines API endpoints like `/categories`, `/categories/:id`.
    *   `CategoriesService`: Handles CRUD operations for categories, interacting with the `PrismaService`.
    *   `DTOs`: `CreateCategoryDto`, `UpdateCategoryDto`, `PaginatedCategoriesDto` for data structuring and validation.

### Subcategories Module

*   **Purpose**: Manages product subcategories, which are nested under main categories, providing a two-level categorization system.
*   **Key Components**:
    *   `SubcategoriesController`: Exposes API endpoints for subcategory operations, often including endpoints related to a parent category.
    *   `SubcategoriesService`: Implements business logic for subcategories, including linking them to parent categories.
    *   `DTOs`: `CreateSubcategoryDto`, `UpdateSubcategoryDto`, `PaginatedSubcategoriesDto`.

### Attributes Module

*   **Purpose**: Manages product attributes (e.g., color, size, material, weight). These attributes can be associated with products to provide detailed specifications and enable filtering.
*   **Key Components**:
    *   `AttributesController`: Defines API endpoints for attribute management.
    *   `AttributesService`: Handles CRUD operations for attributes.
    *   `DTOs`: `CreateAttributeDto`, `UpdateAttributeDto`, `PaginatedAttributesDto`.

### Products Module

*   **Purpose**: The core module for managing products, encompassing product details, variations (e.g., different sizes/colors of the same product), and SEO information. It interacts with Categories, Subcategories, Attributes, and S3 modules.
*   **Key Components**:
    *   `ProductsController`: Defines comprehensive API endpoints for product creation, retrieval (with filters), updating, and deletion.
    *   `ProductsService`: Contains complex business logic for products, including handling product variations, associating attributes, and managing SEO fields. It orchestrates interactions with `CategoriesService`, `AttributesService`, and `S3Service`.
    *   `DTOs`: `AddProductDto`, `CreateProductDto`, `UpdateProductDto`, `PaginatedProductsDto` for various product-related operations.

### S3 Module

*   **Purpose**: Provides services for interacting with AWS S3, primarily for secure file uploads (e.g., product images) and managing stored assets.
*   **Key Components**:
    *   `S3Controller`: (If implemented) May expose endpoints for direct file uploads or signed URL generation.
    *   `S3Service`: Encapsulates the AWS SDK calls (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) for uploading files, generating pre-signed URLs for secure access, and deleting objects from S3 buckets.

### Prisma Module

*   **Purpose**: Centralizes the Prisma client instance and manages its lifecycle, ensuring a single, well-managed connection to the database throughout the application.
*   **Key Components**:
    *   `PrismaService`: Extends `PrismaClient` and implements `OnModuleInit` and `OnModuleDestroy` interfaces to connect to the database when the application starts and disconnect when it shuts down. This service is injected into other services that need database access.

## 4. API Endpoints and Swagger

The application exposes a comprehensive set of RESTful API endpoints. A detailed and interactive API documentation is available via Swagger UI, which is automatically generated from the NestJS application code.

*   **Base URL**: `http://localhost:5000/api/v1` (or your deployed domain). All API routes are prefixed with `/api/v1`.
*   **Swagger UI**: Access the interactive API documentation at `http://localhost:5000/api` (or your deployed domain). This interface allows you to:
    *   View all available endpoints, their HTTP methods (GET, POST, PUT, DELETE).
    *   Understand request parameters, headers, and body schemas (DTOs).
    *   Examine response structures and possible status codes.
    *   Test API calls directly from the browser, including authentication flows (via cookie authentication).

Each module's controller (`*.controller.ts`) defines its specific endpoints. For example, `AuthController` defines authentication-related routes, `ProductsController` defines product management routes, and so on. Request and response payloads are strictly typed using DTOs, ensuring clear contracts for API consumers.

## 5. Error Handling

The application implements centralized error handling to provide consistent and informative error responses. NestJS's exception layer is utilized, potentially with custom exception filters, to catch and format errors. Common error responses include:

*   **400 Bad Request**: For invalid request payloads (e.g., validation errors from `class-validator`).
*   **401 Unauthorized**: For unauthenticated requests or invalid credentials.
*   **403 Forbidden**: For authenticated users who do not have the necessary permissions.
*   **404 Not Found**: When a requested resource does not exist.
*   **500 Internal Server Error**: For unexpected server-side errors.

Error responses typically include a `statusCode`, `message`, and `error` property for clarity.

## 6. Logging

Logging is crucial for monitoring and debugging the application. NestJS provides a built-in logger, and the application can be configured to use more advanced logging solutions (e.g., Winston, Pino) for production environments. Key logging practices include:

*   Logging incoming requests and outgoing responses.
*   Logging significant events (e.g., user login, product creation).
*   Logging errors and exceptions with relevant stack traces.
*   Using appropriate log levels (e.g., `debug`, `info`, `warn`, `error`).

## 7. Security Considerations

Security is a paramount concern for any e-commerce application. The World Rudraksha backend incorporates several security measures:

*   **JWT Authentication**: Securely authenticates users and authorizes access to resources using signed JSON Web Tokens.
*   **Password Hashing**: User passwords are never stored in plain text. `argon2` is used for strong, one-way hashing of passwords before storage.
*   **CORS (Cross-Origin Resource Sharing)**: Configured to allow requests only from specified frontend origins, preventing unauthorized cross-origin access.
*   **Input Validation**: Extensive use of `class-validator` ensures that all incoming data is validated against predefined rules, preventing common injection attacks and data corruption.
*   **Environment Variables**: Sensitive information (e.g., database credentials, JWT secrets, AWS keys) is stored in environment variables and not hardcoded in the codebase.
*   **Cookie-Parser**: Used for parsing cookies, which can be secured with `httpOnly` and `secure` flags in production to prevent client-side access and ensure transmission over HTTPS.

## 8. Database Schema

The database schema is meticulously defined using Prisma Schema Language in `prisma/schema.prisma`. This file serves as the single source of truth for the database model and relationships. It includes definitions for key entities such as:

*   **`User`**: Represents application users, including authentication details, roles (e.g., `ADMIN`, `USER`), and personal information (`firstName`, `lastName`).
*   **`Category`**: Defines product categories, which can have a hierarchical relationship with `Subcategory`.
*   **`Subcategory`**: Represents subcategories nested under main `Category` entities.
*   **`Attribute`**: Defines various product attributes (e.g., `color`, `size`, `material`) that can be associated with products.
*   **`Product`**: The central entity for products, including details like `name`, `description`, `price`, `stock`, `SEO` fields, and relationships to `Category`, `Subcategory`, and `Attribute`.
*   **`ProductVariation`**: (Implicitly or explicitly defined) Handles different variations of a product (e.g., a shirt in different sizes and colors), linking to `Product` and `Attribute`.

Prisma migrations, located in the `prisma/migrations` directory, track changes to the database schema over time. Each migration file (`migration.sql`) contains the SQL commands to apply schema changes.

To visualize the database schema and browse data, you can use `npx prisma studio` after running migrations. This provides a convenient web-based UI for database inspection.

## 9. Contribution Guidelines

We welcome contributions to the World Rudraksha backend! To ensure a smooth collaboration process, please follow these guidelines:

1.  **Fork the repository**: Start by forking the main repository to your GitHub account.
2.  **Create a new branch**: For each new feature or bug fix, create a dedicated branch from `main` (`git checkout -b feature/your-feature-name` or `bugfix/issue-description`).
3.  **Code Style**: Adhere to the existing code style and conventions (ESLint and Prettier configurations are provided).
4.  **Testing**: Write comprehensive unit and/or integration tests for your changes. Ensure all existing tests pass (`npm run test`).
5.  **Linting**: Ensure your code passes linting checks (`npm run lint`). Fix any reported issues.
6.  **Commit Messages**: Write clear, concise, and descriptive commit messages. Follow a conventional commit style (e.g., `feat: Add new user registration endpoint`, `fix: Resolve product update bug`).
7.  **Push to your branch**: Push your changes to your forked repository (`git push origin feature/your-feature-name`).
8.  **Open a Pull Request (PR)**: Submit a Pull Request to the `main` branch of the original repository. Provide a detailed description of your changes and reference any related issues.

## 10. Testing

The project utilizes **Jest** as its testing framework, providing robust capabilities for unit, integration, and end-to-end testing. Testing commands are defined in `package.json`:

*   **Unit Tests**: `npm run test` - Runs all unit tests (files ending with `.spec.ts`). These tests focus on individual components (e.g., services, controllers) in isolation.
*   **End-to-End Tests**: `npm run test:e2e` - Runs end-to-end tests (configured in `test/jest-e2e.json`). These tests simulate real user interactions with the deployed application, ensuring that all components work together correctly.
*   **Test Coverage**: `npm run test:cov` - Generates a test coverage report, indicating which parts of the codebase are covered by tests.
*   **Watch Mode**: `npm run test:watch` - Runs tests in watch mode, re-running tests when relevant files change.

## 11. Deployment

The application is designed for containerized deployment using **Docker**, ensuring consistency across different environments. The deployment process typically involves:

*   **Docker Image**: The `Dockerfile` defines the multi-stage build process for creating a lightweight and production-ready Docker image. It includes steps for installing dependencies, building the application, and setting up the runtime environment.
*   **Environment Variables**: All sensitive configurations (database connection strings, JWT secrets, AWS credentials) are managed through environment variables. These must be correctly configured in the deployment environment (e.g., Kubernetes secrets, Docker Compose `.env` files).
*   **CI/CD Integration**: The `.github/workflows/cicd-workflow.yml` defines the Continuous Integration/Continuous Deployment pipeline. This workflow automates testing, building Docker images, and potentially deploying the application to a cloud provider (e.g., AWS ECR, Kubernetes) upon code pushes or pull request merges.

Refer to the `Dockerfile` and the main `README.md` for detailed instructions on building and running the Docker image locally and for deployment considerations.