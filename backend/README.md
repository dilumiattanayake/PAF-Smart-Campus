# Smart Campus Operations Hub (Spring Boot + MongoDB)

Backend for managing campus resources, bookings, maintenance tickets, comments, and notifications with JWT + role-based access.

## Prerequisites
- Java 21
- Maven 3.9+
- MongoDB (Atlas string pre-configured)

## Run (VS Code friendly)
1. From `backend/`: `./run-backend.ps1`
2. This script stops any process already using port `9199`, then starts Spring Boot.
3. Default admin (seeded if DB empty): email `admin@smartcampus.edu` / password `Admin@123`
4. Swagger UI: `http://localhost:9199/swagger-ui.html`

## Environment
- `spring.data.mongodb.uri` for DB (currently set to your Atlas URI in `application.properties`; comment/uncomment for local)
- `app.jwt.secret` base64 string (set a strong value)
- `app.jwt.expiration-ms` token lifetime in ms
- `app.oauth2.redirect-uri` frontend callback for Google OAuth (defaults to `http://localhost:5173/oauth2/callback`)
- Google OAuth placeholders in `application.properties`

## Core Endpoints
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Resources: `GET /api/resources`, `GET /api/resources/{id}`, `POST /api/resources`, `PUT /api/resources/{id}`, `DELETE /api/resources/{id}`
- Bookings: `POST /api/bookings`, `GET /api/bookings/my`, `GET /api/bookings`, `GET /api/bookings/{id}`, `PATCH /api/bookings/{id}/approve`, `/reject`, `/cancel`
- Tickets: `POST /api/tickets`, `GET /api/tickets/my`, `GET /api/tickets`, `GET /api/tickets/{id}`, `PATCH /api/tickets/{id}/assign/{technicianId}`, `/status`, `/resolution`
- Comments: `POST /api/tickets/{ticketId}/comments`, `GET /api/tickets/{ticketId}/comments`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/read-all`

## Mongo Collections (summary)
- `users`: fullName, email (unique), password, role, active, createdAt, updatedAt
- `resources`: name, type, description, capacity, location, status, availableFrom/To, imageUrl, timestamps
- `bookings`: resourceId, userId, date, startTime, endTime, status, approvedBy, rejectionReason, timestamps
- `tickets`: title, category, description, priority, resourceOrLocation, preferredContact, attachmentUrls, createdByUserId, assignedTechnicianId, status, resolutionNotes, timestamps
- `comments`: ticketId, authorId, authorRole, content, createdAt
- `notifications`: userId, title, message, type, read, referenceId, createdAt

## Postman Tips
- Set `{{baseUrl}} = http://localhost:9199`
- Auth flow: register/login -> store `token` -> add header `Authorization: Bearer {{token}}`
- Test roles quickly with seeded admin; create a user with role USER for booking/ticket flows.

## Troubleshooting Port In Use
- Error: `Port 9199 was already in use`
- Cause: another backend process is already running.
- Fix: use `./run-backend.ps1` instead of running `./mvnw spring-boot:run` repeatedly.
