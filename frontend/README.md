# Campus Lost & Found — React Frontend

React + Vite frontend for the Campus Lost & Found backend.

## Requirements
- Node.js (LTS recommended)
- The Campus Lost & Found backend running on port 8000
- MongoDB running for the backend

## Run locally

1. Extract this ZIP and open the folder in VS Code.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`. By default it uses:
   `VITE_API_URL=http://localhost:8000/api`

4. Start the backend in its own terminal (`npm run dev` in the backend folder).
5. Start this frontend:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:5173`.

## Included pages
- Home and recent community posts
- Register and login
- Browse/search/filter lost and found posts
- Create lost/found post
- Item details and claim request
- My posts and delete own posts
- Admin moderation page (delete posts)

## Backend API compatibility
This frontend expects these backend endpoints:
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /items`, `GET /items/:id`, `POST /items`, `PUT /items/:id`, `DELETE /items/:id`
- `POST /claims`, `GET /claims/item/:itemId`, `PATCH /claims/:id`

The backend CORS `CLIENT_URL` should be `http://localhost:5173`.

## Notes
- This frontend stores the JWT in localStorage for a straightforward student project integration. For a production app, prefer secure, HttpOnly cookies and additional CSRF/XSS protections.
- Item images are currently supplied as image URLs. The backend image upload feature is not included.
- The admin page uses the existing item APIs. User-management screens are not included because the backend does not expose user-management endpoints.
