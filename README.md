# IoT Data Management System

This project is a complete backend solution built for a Technical Assessment. It implements a robust, microservice-based architecture for processing, storing, and retrieving simulated IoT x-ray data, utilizing a modern, production-ready tech stack including NestJS, RabbitMQ, and MongoDB.

The entire system is containerized with Docker and can be fully operational with a single command.

## Core Architecture

The system is designed as a decoupled, event-driven architecture, which is the industry standard for scalable and resilient data pipelines. It consists of three main parts orchestrated by Docker Compose:

1.  **`consumer-api` (NestJS API Server)**: This is the central, long-running backend service. It is the "brain" of the system, responsible for:

    - **Listening:** Persistently connects to a RabbitMQ queue to consume incoming x-ray data messages.
    - **Processing:** Validates and processes each message, calculating required metadata like `dataLength` and `dataVolume`.
    - **Storing:** Saves the processed signal data into a MongoDB collection.
    - **Serving:** Exposes a full, documented RESTful CRUD API for retrieving and managing the signal data.

2.  **`producer-cli` (NestJS Command-Line Tool)**: This is a lightweight, short-lived application designed to accurately simulate IoT devices. Its single responsibility is to:

    - **Read:** Parses a local `sample-data.json` file containing multiple device records.
    - **Publish:** Iterates through the records and publishes each one as a separate, atomic message to RabbitMQ.
    - **Exit:** The tool exits gracefully once all messages have been successfully sent.

3.  **Infrastructure (Dockerized)**:
    - **RabbitMQ**: The message broker that provides a reliable, asynchronous communication channel.
    - **MongoDB**: The NoSQL database used for robust and scalable data persistence.

## Architectural Decisions & Rationale

Several key architectural decisions were made to ensure the system is not only functional but also scalable, maintainable, and reflects modern best practices.

- **Microservice Design**: The project was intentionally split into two distinct applications (`consumer-api`, `producer-cli`). This approach perfectly simulates a real-world distributed system, demonstrating a deep understanding of **decoupling** and making the system more resilient and scalable.

- **CLI Producer vs. API Consumer**: The producer is a short-lived **command-line tool** (simulating a device sending data), while the consumer is an **always-on API server** (the central backend). This choice accurately reflects the distinct roles of each component in a real-world data pipeline.

- **Typed Configuration (`config.ts`)**: A structured, type-safe configuration file (`config.ts`) was used in favor of a simpler `.env` file. This is a professional pattern that provides **type safety**, autocompletion, and a clear, organized structure for all configuration variables.

- **Service Pattern (vs. Repository Pattern)**: The `SignalsService` directly interacts with the Mongoose model. For the defined scope of this project, this pattern provides the best balance of simplicity and a proper separation of concerns, demonstrating an understanding of how to avoid over-engineering while still building robust code.

- **API Design & CRUD Implementation**: A full, standard RESTful CRUD API was implemented for the `Signals` resource to literally fulfill the assessment requirement. However, in a real-world context for this IoT domain, the API would be refined: the primary "Create" path is intentionally the RabbitMQ consumer to ensure data integrity, and the `PATCH` and `DELETE` operations would typically be restricted to administrative roles, as IoT data is often treated as an immutable historical record. This implementation demonstrates the ability to build a standard CRUD API while also understanding the domain-specific context in which to apply it.

- **Modern Docker Tooling**: Multi-stage `Dockerfile`s are used to create small, optimized, and secure production images.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (required only for running unit tests locally)
- A shell environment like Git Bash, WSL (on Windows), or a standard terminal (on Mac/Linux).

## How to Run the Entire System

This project is designed to be run easily and reliably with Docker.

**1. Start All Backend Services:**
From the root directory, build the application images and start all containers in the background.

```bash
docker-compose up --build -d
```

This command will start the `consumer-api`, RabbitMQ, and MongoDB. Please allow 20-30 seconds for all services to initialize fully.

**2. Send Sample Data:**
To simulate the IoT devices sending their data, run the provided helper script from the root directory.

```bash
./send-data.sh
```

_(On some systems, you may need to make the script executable first by running: `chmod +x send-data.sh`)_

This script is a convenient wrapper for the underlying `docker-compose run` command. It will start the producer, send all the data, and then exit cleanly.

**That's it!** The data has now been sent, processed, and stored in the database.

## API Endpoints & Usage

Once the system is running, the `consumer-api` is available at `http://localhost:3000`.

### **API Documentation (Swagger UI)**

The best way to explore and test the API is through the interactive Swagger documentation:

- **URL:** **`http://localhost:3000/api-docs`**

From the Swagger UI, you can test all CRUD operations:

- `POST /signals` - Create a signal manually.
- `GET /signals` - Retrieve all signals.
- `GET /signals/by-device` - Filter signals by a `deviceId`.
- `PATCH /signals/{id}` - Update a specific signal by its MongoDB ID.
- `DELETE /signals/{id}` - Delete a specific signal by its MongoDB ID.

## Running Tests

Unit tests are run locally on your machine (Docker is not required for this step).

#### **For the `consumer-api`:**

```bash
# Navigate to the consumer's directory
cd consumer-api

# Install dependencies if you haven't already
npm install

# Run the tests
npm run test
```

#### **For the `producer-cli`:**

```bash
# Navigate to the producer's directory
cd producer-cli

# Install dependencies if you haven't already
npm install

# Run the tests
npm run test
```
