# Smart HR Outreach Automation Backend

A clean Node.js, Express.js, MongoDB, Nodemailer, and Multer backend for storing HR email leads, uploading a resume, and sending personalized bulk outreach emails from a common HTML template.

## Features

- Upload HR emails from CSV or JSON
- Prevent duplicate email records
- Store resume metadata and attach the latest resume automatically
- Send bulk emails with `{{name}}` and `{{company}}` template variables
- Skip already sent emails
- Retry failed emails up to a configurable limit
- Delay between emails to reduce SMTP throttling risk
- Track status as `pending`, `sent`, or `failed`
- Mark selected email addresses as `skipped` so they stay stored but do not receive bulk emails
- Log email activity to `logs/logs.txt`

## Project Structure

```text
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
uploads/
logs/
template.html
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB Atlas URI and Gmail app password.

4. Start the server:

```bash
npm run dev
```

Production:

```bash
npm start
```

## Gmail App Password

Use a Gmail app password, not your normal Gmail password. In your Google Account, enable 2-Step Verification, then create an app password for mail access.

## API Endpoints

Base URL:

```text
http://localhost:5000/api
```

The same endpoints are also available without `/api`, for example `POST /send-emails`, to match simple deployment or testing setups.

## Frontend

The backend serves a built-in frontend from `public/`.

After starting the server, open:

```text
http://localhost:5000
```

Screens included:

- Dashboard with email counts and latest resume
- Single email add, email upload, email table, and delete action
- Resume upload, current resume details, and PDF preview
- Bulk send screen connected to `POST /api/send-emails`
- Day by day email send reports

### Health Check

```http
GET /api/health
```

### Upload Emails

```http
POST /api/emails/upload
Content-Type: multipart/form-data
Field name: file
```

Accepted files:

- `.csv` with columns: `email,name,company`
- `.json` with format:

```json
[
  {
    "email": "hr@example.com",
    "name": "Priya",
    "company": "Example Inc"
  }
]
```

### Add Single Email

```http
POST /api/emails
Content-Type: application/json
```

```json
{
  "email": "hr@example.com",
  "name": "Priya",
  "company": "Example Inc"
}
```

### Fetch Emails

```http
GET /api/emails
```

Optional query filters:

```text
GET /api/emails?status=pending
```

### Delete Email

```http
DELETE /api/emails/:id
```

### Skip Or Unskip Email

```http
PATCH /api/emails/:id/skip
Content-Type: application/json
```

```json
{
  "skip": true
}
```

### Upload Resume

```http
POST /api/resume/upload
Content-Type: multipart/form-data
Field name: resume
```

Accepted files:

- `.pdf`
- `.doc`
- `.docx`

### Get Latest Resume

```http
GET /api/resume
```

### Send Bulk Emails

```http
POST /api/send-emails
```

This sends emails to records with status `pending` or `failed`, skips already sent records, attaches the latest uploaded resume, updates each email status, and returns success/failed counts.

To resend emails that already have `status: sent`, send:

```json
{
  "includeSent": true
}
```

### Email Send Reports

```http
GET /api/reports
```

Returns day by day aggregated send reports, including total runs, eligible emails, sent count, failed count, skipped sent count, and resent sent count.

## Deployment Notes

This project is ready for Render, Railway, or a VPS:

- Set all `.env` values in your hosting provider dashboard
- Use `npm start` as the start command
- Use MongoDB Atlas for `MONGODB_URI`
- Make sure persistent storage is available if uploaded resumes must survive redeploys

For long-term production use, consider moving resume storage from local disk to S3, Cloudinary, or another durable file storage provider.
