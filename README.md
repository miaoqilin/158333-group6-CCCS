# Campus Coffee and Catering Services

Campus Coffee and Catering Services is a MERN full-stack web application for campus food ordering, catering package management, vendor management, admin review, customer feedback, simulated payment, AI recommendation, and Live2D assistant interaction.

The system supports three account roles:

- **Customer / Student**: browse menu items, add single items or packages to cart, place orders, choose payment methods, save preferences, view order history, and submit feedback.
- **Vendor**: submit menu items and catering packages, manage item availability, view vendor orders, view feedback, and generate Gemini AI business analysis.
- **Admin**: manage users, approve vendors, review menu items, manage orders, manage feedback, and oversee the platform dashboard.

---

## Project Structure

```text
158333-group6-CCCS/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   ├── utils/
│   │   └── app.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   └── live2d/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── package-lock.json
│
├── doc/
├── graph/
│   └── erd.png
├── README.md
└── .gitignore
```

---

## Important Notes Before Running

The real `.env` file is **not uploaded to GitHub** for security reasons.

Instead, this repository includes:

```text
backend/.env.example
```

After downloading or cloning the project, you must copy `.env.example` and rename the copy to `.env`:


---

## ERD Diagram

The ERD diagram is included in the GitHub repository because it was not inserted into the final report document.

You can find it here:

```text
graph/erd.png
```

The diagram shows the main database collections and relationships, including:

- User
- MenuItem
- Order
- Feedback
- Embedded coupons
- Embedded package items
- Embedded order items

---

## Requirements

Before running the project locally, install:

- Node.js
- npm
- MongoDB Atlas account or local MongoDB database
- Git
- Google Gemini API key, optional but required for AI functions
- Gmail App Password or other SMTP credentials, optional but required for real order confirmation email

Recommended versions:

```text
Node.js: 18 or above
npm: 9 or above
MongoDB: Atlas or local MongoDB
```

---

## Downloading the Project from GitHub

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/158333-group6-CCCS.git
```

Enter the project folder:

```bash
cd 158333-group6-CCCS
```

If you download the ZIP file instead, unzip it first, then open a terminal inside the project root folder.

---

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

Create the real `.env` file from `.env.example`:
（just rename it to .env）

```bash
npm run dev
```

If successful, the terminal should show:

```text
MongoDB connected
Server running on port 5000
```

The backend API will run at:

```text
http://localhost:5000
```

---

## Frontend Setup

Open a new terminal window and go to the frontend folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will run at:

```text
http://localhost:3000
```

---

## Running the Full Local Website

To run the full website locally, use two terminal windows.

Terminal 1, backend:

```bash
cd backend
npm run dev
```

Terminal 2, frontend:

```bash
cd frontend
npm start
```

Then open:

```text
http://localhost:3000
```

---

## Account Setup

you can create new account to test ,but there are some account for testing already

user:
test1@qq.com
123456

vendor:
test2@qq.com
123456

admin:
admin@admin.com
123456

## Environment Variables

The backend uses these environment variables:

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT authentication |
| `EMAIL_HOST` | SMTP email host |
| `EMAIL_PORT` | SMTP email port |
| `EMAIL_USER` | SMTP account email |
| `EMAIL_PASS` | SMTP password or Gmail App Password |
| `EMAIL_FROM` | Sender name and email |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model name |

The real `.env` file should never be committed to GitHub.

Only `.env.example` should be committed.

---

## Main Backend API Routes

### Auth

```text
POST /api/auth/register
POST /api/auth/register-vendor
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile
```

### Menu

```text
GET    /api/menu
GET    /api/menu/:id
POST   /api/menu/vendor
GET    /api/menu/vendor/my
PUT    /api/menu/vendor/:id
PUT    /api/menu/vendor/:id/toggle
GET    /api/menu/admin/all
GET    /api/menu/admin/pending
PUT    /api/menu/admin/:id/approve
PUT    /api/menu/admin/:id/reject
PUT    /api/menu/admin/:id/toggle
POST   /api/menu
PUT    /api/menu/:id
DELETE /api/menu/:id
```

### Orders

```text
POST /api/orders
GET  /api/orders/my
GET  /api/orders/:id
GET  /api/orders/admin/all
GET  /api/orders/vendor/my
GET  /api/orders/vendor/analytics
PUT  /api/orders/:id/status
```

### Feedback

```text
POST   /api/feedback
GET    /api/feedback/my
GET    /api/feedback/vendor
PUT    /api/feedback/vendor/:id/reply
PUT    /api/feedback/:id/handled
GET    /api/feedback/admin/all
DELETE /api/feedback/admin/:id
```

### Admin

```text
GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/role
PUT    /api/admin/users/:id/status
DELETE /api/admin/users/:id
GET    /api/admin/vendors
PUT    /api/admin/vendors/:id/approve
PUT    /api/admin/vendors/:id/reject
```

### Vendor

```text
GET /api/vendor/dashboard
GET /api/vendor/profile
PUT /api/vendor/profile
```

### AI

```text
GET /api/ai/package-suggestion
GET /api/ai/vendor/analysis
```

---

## Live2D Assistant

The frontend includes a Live2D assistant in the bottom-right corner of the website.

The model files should be placed under:

```text
frontend/public/live2d/
```

For example:

```text
frontend/public/live2d/haru/runtime/haru_greeter_t05.model3.json
```

If the Live2D model does not display, check that the model path in:

```text
frontend/src/components/Live2DAssistant.jsx
```

matches the real `.model3.json` path.

The assistant allows users to type what they want to eat, then calls the backend Gemini API route to recommend available menu items or packages.

---

## Real Email Order Confirmation

After a customer places an order, the backend sends a real confirmation email to the customer's registered email address if SMTP details are configured correctly in `.env`.

For Gmail, use a Gmail App Password instead of the normal Gmail login password.

If email sending fails, the order can still be created, but the notification field will show the email error message.

---

## Gemini AI Features

Gemini is used for:

1. Live2D customer menu recommendation.
2. Vendor business and sales analysis.

To enable these functions, set:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
```

If Gemini is not configured, the system will return fallback responses instead of crashing.

---

## Common Problems and Fixes

### Backend cannot connect to MongoDB

Check `MONGODB_URI` in `backend/.env`.

Make sure your IP address is allowed in MongoDB Atlas Network Access.

---

### Login works but admin page is not visible

Check the user document in MongoDB and confirm:

```json
{
  "role": "admin",
  "isActive": true
}
```

Then log out and log in again.

---

### Vendor cannot access vendor panel

Check that the vendor has been approved:

```json
{
  "role": "vendor",
  "vendorStatus": "approved",
  "isActive": true
}
```

---

### Menu page is empty

Only menu items with the following values are shown publicly:

```json
{
  "approvalStatus": "approved",
  "isAvailable": true
}
```

If a vendor submits an item, admin must approve it first.

---

### Live2D model does not load

Open the model path directly in the browser, for example:

```text
http://localhost:3000/live2d/haru/runtime/haru_greeter_t05.model3.json
```

It must show JSON content. If it shows the React homepage or an HTML page, the model path is wrong.

---

### Gemini always returns fallback

Check:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
```

Restart the backend after editing `.env`.

Test the route directly:

```text
http://localhost:5000/api/ai/package-suggestion?query=I%20want%20vegan%20lunch
```

---

## GitHub Submission Notes

Before pushing to GitHub, make sure:

- `node_modules/` is not committed.
- `backend/.env` is not committed.
- `backend/.env.example` is committed.
- `graph/erd.png` is committed.
- Live2D runtime files are committed if they are required for the demo.
- The final report can mention that the ERD diagram is available in the GitHub repository.

Recommended `.gitignore` entries:

```gitignore
node_modules/
.env
.DS_Store
npm-debug.log*
```

---

## Authors

Group 6 — Campus Coffee and Catering Services Web Application

- Yanbo Du
- Yiqi Sun
- Bowei Hu
- Tianshi Yang
- Qijia Di

---

## License

This project is developed for the 159333 Programming Project course. It is intended for academic submission and demonstration purposes.
