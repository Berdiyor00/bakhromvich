# HOT WALLS 3D - Full Stack Website

Production-ready full stack website with:
- Video hero header and 3D visual background
- Public landing page (services, gallery, testimonials, contact)
- Registration and login
- Admin panel to edit all website content
- Admin media upload endpoint
- Registered users list
- Express + Prisma + SQLite backend
- React + Vite + TypeScript frontend
- Docker support

## Tech Stack
- Frontend: React, Vite, TypeScript, react-router-dom, @react-three/fiber, drei
- Backend: Node.js, Express, TypeScript, Prisma ORM, SQLite, JWT, Multer

## Project Structure
- client: React frontend
- server: API + database

## Local Development
### 1) Backend
1. Open terminal in server
2. Copy env:
   - create .env from .env.example
3. Install and init:
   - npm install
   - npm run prisma:generate
   - npm run prisma:push
   - npm run seed
4. Start backend:
   - npm run dev

Backend runs on http://localhost:5000

Default admin login:
- Email: admin@hotwalls.uz
- Password: Admin12345

### 2) Frontend
1. Open terminal in client
2. Create .env from .env.example
3. Install and run:
   - npm install
   - npm run dev

Frontend runs on http://localhost:5173

## Production Build
### Backend
- npm run build
- npm run start

### Frontend
- npm run build
- npm run preview

## Docker Deployment
From project root:
- docker compose up --build -d

Services:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000

## Admin Panel Capabilities
- Edit hero section title/subtitle/video
- Edit about section
- Edit services/gallery/testimonials through JSON fields
- Edit contact information
- Upload media files and use returned URLs
- View all registered users

## Deployment on VPS
1. Install Node.js 20+, npm, and optionally Docker
2. Clone project to server
3. Configure server/.env and client/.env
4. Run backend build/start and frontend build
5. Put frontend dist behind Nginx
6. Run backend with PM2 or systemd
7. Open ports 80 (frontend) and 5000 (backend) or reverse proxy both under one domain

## API Endpoints
- GET /api/public/content
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/admin/content (admin)
- PUT /api/admin/content (admin)
- GET /api/admin/users (admin)
- POST /api/upload/media (admin)

## Notes
- Replace demo media URLs and content with your own branding/assets
- Change JWT secret before production
- Use HTTPS in production
