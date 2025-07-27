# World Rudraksha Backend

This is the backend application for the World Rudraksha e-commerce platform, built with NestJS. It provides RESTful APIs for managing users, products, categories, attributes, and handles authentication and S3 integration.

## Technologies Used

*   **NestJS**: A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
*   **Prisma**: A next-generation ORM for Node.js and TypeScript.
*   **PostgreSQL**: A powerful, open source object-relational database system.
*   **JWT (JSON Web Tokens)**: For authentication and authorization.
*   **AWS S3**: For file storage (e.g., product images).
*   **Docker**: For containerization.

## Setup Instructions

### Prerequisites

*   Node.js (v20.x or higher)
*   npm or pnpm
*   PostgreSQL database
*   Docker (optional, for containerized deployment)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/world-rudraksha-backend.git
    cd world-rudraksha-backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or if you use pnpm
    # pnpm install
    ```

### Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/world_rudraksha_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRATION="1h"
REFRESH_TOKEN_SECRET="your_refresh_token_secret_key"
REFRESH_TOKEN_EXPIRATION="7d"
AWS_ACCESS_KEY_ID="your_aws_access_key_id"
AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"
AWS_REGION="your_aws_region"
AWS_S3_BUCKET_NAME="your_s3_bucket_name"
```

### Database Setup

1.  Ensure your PostgreSQL database is running.
2.  Run Prisma migrations to set up your database schema:
    ```bash
    npx prisma migrate dev --name init
    ```

### Running the Application

#### Development

```bash
npm run start:dev
# or if you use pnpm
# pnpm run start:dev
```

The application will be accessible at `http://localhost:5000` (or the port configured in `main.ts`).

#### Production Build

```bash
npm run build
npm run start:prod
# or if you use pnpm
# pnpm run build
# pnpm run start:prod
```

### Dockerization

You can build and run the application using Docker:

1.  Build the Docker image:
    ```bash
    docker build -t world-rudraksha-backend .
    ```

2.  Run the Docker container:
    ```bash
    docker run -p 5000:5000 --env-file ./.env world-rudraksha-backend
    ```

    Make sure your `.env` file is correctly configured with the database URL accessible from within the Docker container (e.g., if your database is on `localhost`, you might need to use `host.docker.internal` as the host in the `DATABASE_URL` for Docker Desktop on Windows/Mac, or the appropriate IP address for Linux).

## API Endpoints (Overview)

The application exposes various RESTful API endpoints for managing different resources. Key modules include:

*   `/auth`: User authentication (signup, login, refresh token).
*   `/users`: User management (if applicable, e.g., for admin roles).
*   `/categories`: Category management (create, read, update, delete categories).
*   `/subcategories`: Subcategory management.
*   `/products`: Product management (create, read, update, delete products, handle product variations and SEO).
*   `/attributes`: Product attribute management.
*   `/s3`: S3 file upload and management.

Detailed API documentation (e.g., Swagger/OpenAPI) can be generated or will be available once the application is running.