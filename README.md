# Nexus Chat Project

## Overview
Nexus is a real-time, web-based chat application inspired by WhatsApp. It allows users to register with a username/password, find other users, and communicate in real-time.

## Core Architectural Decisions
- **Monolith Approach**: Single project containing both backend and frontend.
- **Backend**: Spring Boot 3 (Java 21).
- **Frontend**: React (located in the /frontend directory).
- **API Documentation**: SpringDoc OpenAPI (Swagger UI).
- **Real-time Communication**: WebSockets.
- **Database**: PostgreSQL.
- **Containerization**: The entire stack is managed by Docker Compose.
- **Build Tool**: Gradle.
