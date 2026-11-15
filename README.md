# Campus Lost & Found Frontend

Pure HTML and CSS frontend for Campus Lost & Found.

## Requirements
- Node.js (LTS recommended)
- The Campus Lost & Found backend
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


# Campus Lost & Found Backend

REST API built with Node.js, Express, MongoDB and Mongoose using an MVC-style structure.

## Requirements

- Node.js (LTS recommended)
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- Postman (for API testing)

## Setup

1. Open this folder in VS Code.
2. Install packages:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`.
4. Set `MONGO_URI`, a long random `JWT_SECRET`, and `CLIENT_URL` in `.env`.
5. Start MongoDB.
6. Start the API:

   ```bash
   npm run dev
   ```

7. Visit `http://localhost:8000`.

## API endpoints

### Authentication

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Bearer token |

Registration always creates a `student`. For a class/demo project, promote a trusted account manually in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@yourcollege.edu" },
  { $set: { role: "admin" } }
)
```

Do not create a public endpoint that lets users choose their own role.

### Items

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/items` | Public |
| GET | `/api/items/:id` | Public |
| POST | `/api/items` | Bearer token |
| PUT | `/api/items/:id` | Owner or admin |
| DELETE | `/api/items/:id` | Owner or admin |

Query examples:

- `/api/items?type=lost`
- `/api/items?type=found`
- `/api/items?category=Accessories`
- `/api/items?search=wallet`
- `/api/items?page=1&limit=10`

Create item JSON:

```json
{
  "title": "Black wallet",
  "description": "Black leather wallet lost near the library",
  "category": "Accessories",
  "location": "College Library",
  "itemType": "lost",
  "date": "2026-11-02"
}
```

### Claims

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/claims` | Bearer token |
| GET | `/api/claims/item/:itemId` | Item owner or admin |
| PATCH | `/api/claims/:id` | Item owner or admin |

Submit claim JSON:

```json
{
  "itemId": "REPLACE_WITH_ITEM_OBJECT_ID",
  "message": "I believe this wallet belongs to me. I can describe its contents."
}
```

Approve/reject JSON:

```json
{
  "status": "approved"
}
```

## Authentication in Postman

After login, copy the `token` from the response. For protected requests choose **Authorization → Bearer Token** and paste it.

## Important notes

- `imageUrl` currently stores a URL; image file upload is not implemented. Add Multer and a storage provider such as Cloudinary if uploads are required.
- This is an educational starter backend, not a fully production-hardened service.
- Claim approval and item status changes should use a MongoDB transaction or another concurrency-safe design before production deployment.
- Use HTTPS, secure token storage, email verification and password-reset flows before real deployment.
- The admin promotion command is intended only for controlled local project setup.