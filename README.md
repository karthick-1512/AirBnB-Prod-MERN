# Airbnb Clone — MERN 

**Live Demo:** [ CLICK HERE ](https://airbnb-prod.vercel.app/)

Welcome! This is a clean, production-ready Airbnb-style web app built with the MERN stack and Tailwind CSS. Hosts can create and manage listings, while guests can search, book, and cancel reservations. The user interface automatically prevents guests from booking dates that are already taken.

---

## Features

- **User Authentication:** Secure user authentication using JWT and sessions.
- **Listing Management:** Create, edit, and delete listings with details like images, perks, and pricing.
- **Booking System:** Guests can select dates, and the app automatically calculates the total cost.
- **Availability:** The UI prevents double-booking by disabling dates that are already reserved.
- **Image Storage:** Images are securely stored using **Supabase Storage**.
- **Data Management:** All listing and user data is stored in a **MongoDB** database.
- **Search Functionality:** Guests can search for listings by location, dates, and other specific criteria.

---

## Tech Stack

- **Frontend:** React with Tailwind CSS for a modern, responsive design.
- **Backend:** Node.js and Express for a robust and scalable server.
- **Database:** MongoDB, with Mongoose for data modeling.
- **Hosting:** Frontend on Vercel, Backend on Render.

---

### How to Run

---

#### Backend

```bash
cd backend-node
# Set your environment variables (MONGO_URI, SUPABASE_URL & SUPABASE_KEY)
npm install
node server.js
```
#### Frontend

```bash
cd frontend-react
# set env var REACT_APP_API_URL to your backend URL
npm install
npm run dev
```
