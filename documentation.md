# World Rudraksha Backend Documentation

This document provides detailed information about the World Rudraksha backend application, covering its architecture, modules, API endpoints, and guidelines for development and contribution.

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
5.  [Database Schema](#database-schema)
6.  [Contribution Guidelines](#contribution-guidelines)
7.  [Testing](#testing)
8.  [Deployment](#deployment)

## 1. Project Overview

The World Rudraksha backend is a robust and scalable e-commerce API built with NestJS. It serves as the core for managing all aspects of the online store, including user authentication, product catalog management, category and subcategory organization, product attributes, and integration with AWS S3 for media storage.

## 2. Architecture

The application is built using the **NestJS** framework, which follows a modular and highly organized structure. Key architectural decisions include:

*   **Modular Design**: The application is divided into distinct modules (e.g., `AuthModule`, `ProductsModule`), each encapsulating related functionalities, controllers, services, and entities.
*   **Dependency Injection**: NestJS's powerful dependency injection system is utilized throughout the application for managing dependencies and promoting testability.
*   **Prisma ORM**: **Prisma** is used as the Object-Relational Mapper (ORM) for interacting with the PostgreSQL database, providing a type-safe and efficient way to perform database operations.
*   **RESTful APIs**: All interactions with the frontend are exposed via RESTful API endpoints.
*   **Authentication**: JWT (JSON Web Tokens) are used for secure authentication and authorization.
*   **File Storage**: AWS S3 is integrated for scalable and reliable storage of product images and other media.

## 3. Modules Breakdown

Each module in the `src` directory is responsible for a specific domain or feature:

### Auth Module

*   **Purpose**: Handles user registration, login, token generation (access and refresh tokens), and authentication guards.
*   **Key Components**:
    *   `AuthController`: Manages authentication-related API endpoints.
    *   `AuthService`: Contains the business logic for user authentication.
    *   `JwtStrategy`, `LocalStrategy`, `RefreshTokenStrategy`: Passport strategies for different authentication flows.
    *   `Guards`: Implement authentication and role-based authorization.
    *   `DTOs`: Data Transfer Objects for signup, login, etc.

### Categories Module

*   **Purpose**: Manages product categories, including creation, retrieval, updating, and deletion.
*   **Key Components**:
    *   `CategoriesController`: Exposes API endpoints for category management.
    *   `CategoriesService`: Handles the business logic for categories, interacting with Prisma.
    *   `DTOs`: For creating, updating, and paginating categories.

### Subcategories Module

*   **Purpose**: Manages product subcategories, which are nested under categories.
*   **Key Components**:
    *   `SubcategoriesController`: API endpoints for subcategory operations.
    *   `SubcategoriesService`: Business logic for subcategories.
    *   `DTOs`: For creating, updating, and paginating subcategories.

### Attributes Module

*   **Purpose**: Manages product attributes (e.g., color, size, material) that can be associated with products.
*   **Key Components**:
    *   `AttributesController`: API endpoints for attribute management.
    *   `AttributesService`: Business logic for attributes.
    *   `DTOs`: For creating, updating, and paginating attributes.

### Products Module

*   **Purpose**: Core module for managing products, including product details, variations, and SEO information.
*   **Key Components**:
    *   `ProductsController`: API endpoints for product management.
    *   `ProductsService`: Business logic for products, handling interactions with categories, attributes, and S3.
    *   `DTOs`: For adding, creating, updating, and paginating products.

### S3 Module

*   **Purpose**: Provides services for interacting with AWS S3 for file uploads and management.
*   **Key Components**:
    *   `S3Controller`: (If applicable) API endpoints for direct S3 interactions.
    *   `S3Service`: Encapsulates AWS S3 SDK calls for uploading, retrieving, and deleting files.

### Prisma Module

*   **Purpose**: Centralizes the Prisma client instance and handles database connection lifecycle.
*   **Key Components**:
    *   `PrismaService`: Extends `PrismaClient` and manages database connection and disconnection on module initialization and destruction.

## 4. API Endpoints and Swagger

The application exposes RESTful API endpoints. A comprehensive API documentation is available via Swagger UI.

*   **Base URL**: `http://localhost:5000/api/v1` (or your deployed domain)
*   **Swagger UI**: Access the interactive API documentation at `http://localhost:5000/api` (or your deployed domain).

The Swagger documentation provides details on all available endpoints, request/response schemas, and allows you to test API calls directly from the browser.

## 5. Database Schema

The database schema is defined using Prisma Schema Language in `prisma/schema.prisma`. This file is the single source of truth for your database model. It includes definitions for:

*   `User` (with roles, first name, last name)
*   `Category`
*   `Subcategory`
*   `Attribute`
*   `Product` (with variations, SEO fields)
*   And other related models for product variations, etc.

To visualize the database schema, you can use `npx prisma studio` after running migrations.

## 6. Contribution Guidelines

We welcome contributions to the World Rudraksha backend! To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Make your changes, adhering to the existing code style and conventions.
4.  Write unit and/or integration tests for your changes.
5.  Ensure all tests pass (`npm run test`).
6.  Ensure linting passes (`npm run lint`).
7.  Commit your changes (`git commit -m "feat: Add new feature"`).
8.  Push to your branch (`git push origin feature/your-feature-name`).
9.  Open a Pull Request to the `main` branch of the original repository.

## 7. Testing

The project uses Jest for testing. You can run tests using the following commands:

*   **Unit Tests**: `npm run test`
*   **End-to-End Tests**: `npm run test:e2e`
*   **Test Coverage**: `npm run test:cov`

## 8. Deployment

The application is containerized using Docker, making it easy to deploy to various environments.

*   **Docker Image**: The `Dockerfile` defines the steps to build a production-ready Docker image.
*   **Environment Variables**: Ensure all necessary environment variables (especially database connection and JWT secrets) are correctly configured in your deployment environment.
*   **CI/CD**: The `.github/workflows/cicd-workflow.yml` defines the CI/CD pipeline for automated testing and deployment (if configured).

Refer to the `Dockerfile` and `README.md` for detailed instructions on building and running the Docker image.
