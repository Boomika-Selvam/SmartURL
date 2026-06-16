# SmartURL - Intelligent URL Shortener

SmartURL is a beginner-friendly MEAN stack URL shortener with JWT authentication, Google Gmail OAuth login, custom aliases, simple alias suggestions, redirect tracking, and a user dashboard.

## Tech Stack

- MongoDB with Mongoose
- Express.js and Node.js
- Angular 11
- JWT authentication
- Google OAuth login

## Project Structure

```text
SmartURL/
  backend/
  frontend/
```

## Backend Setup

1. Open a terminal in `backend`.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

4. Start MongoDB locally, or use MongoDB Atlas.

Local MongoDB example:

```text
mongodb://127.0.0.1:27017/smarturl
```

5. Add Google OAuth credentials:

- Create a project in Google Cloud Console.
- Configure OAuth consent screen.
- Create an OAuth 2.0 Client ID for a web app.
- Add this authorized JavaScript origin:

```text
http://localhost:4200
```

- Put the client ID in `backend/.env` as `GOOGLE_CLIENT_ID`.
- Put the same client ID in `frontend/src/environments/environment.ts`.

6. Run the backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

## Frontend Setup

1. Open a second terminal in `frontend`.
2. Install dependencies:

```bash
npm install
```

3. Run Angular:

```bash
npm start
```

Frontend runs on:

```text
http://localhost:4200
```

## Test Flow

1. Open `http://localhost:4200`.
2. Register a new account, or sign in with Google after configuring OAuth.
3. Paste a long URL on the home page.
4. Click Analyze to generate alias suggestions.
5. Choose a suggestion or enter a custom alias.
6. Click Create Short URL.
7. Copy and open the generated URL, such as `http://localhost:5000/chatgpt`.
8. Confirm it redirects to the original long URL.
9. Open Dashboard to see saved URLs, click counts, dates, and delete/copy actions.

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/me`
- `POST /api/urls/suggest`
- `POST /api/urls`
- `GET /api/urls`
- `DELETE /api/urls/:id`
- `GET /:alias`

