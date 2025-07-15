URL Shortener Backend

This is a simple backend for a URL shortener. It lets you create short links that expire after 30 minutes by default. It also tracks how many times each link is clicked.

How to run
1. Make sure you have Node.js and MongoDB installed.
2. Install dependencies:
   npm install
3. Start MongoDB .
4. Start the server:
   npm start

API
- `POST /shorturls` — Create a short URL. 
    Body: `{ url: string, validity?: number, shortcode?: string }`
- `GET /:code` — Redirect to the original URL.
- `GET /shorturls/:code` — Get stats for a short URL.

Structure
- `Backend/models/` — Mongoose models
- `Backend/controllers/` — Business logic
- `Backend/routes/` — API routes
- `Backend/index.ts` — App entry point

