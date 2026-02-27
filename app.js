require("dotenv").config({ quiet: true });

const cors = require("cors");
const express = require("express");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URL,
);

// Set the refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

// Test transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Transporter error:", error);
  } else {
    console.log("✅ Transporter ready to send emails");
  }
});

// Create a transporter object
/* let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use false for STARTTLS; true for SSL on port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
 */

// Define route to handle form submission
app.post("/send-email", (req, res) => {
  // Extract form data from request body
  const { FullName, EmailId, PhoneNumber, Message } = req.body;

  // Read HTML template file
  let template = fs.readFileSync(
    path.join(__dirname, "View", "emailTemplate.html"),
    "utf-8",
  );

  //  Replace placeholders with dynamic data
  template = template
    .replace("{{fullName}}", FullName)
    .replace("{{fullName}}", FullName)
    .replace("{{email}}", EmailId)
    .replace("{{phoneNumber}}", PhoneNumber)
    .replace("{{message}}", Message);

  // Configure the mailoptions object
  let mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: EmailId, // Recipient email (user)
    bcc: process.env.EMAIL_OWNER, // Owner hidden in BCC
    subject: "Welcome!", // Email subject
    html: template, // Final HTML body
    attachments: [
      {
        filename: "android-chrome-192x192.png", // File fullName of image
        path: "./assets/android-chrome-192x192.png", // Path to image file
        cid: "logo", // Must match cid in HTML
      },
      {
        filename: "icons8-instagram-logo-94.png",
        path: "./assets/icons8-instagram-logo-94.png",
        cid: "instaLogo",
      },
      {
        filename: "icons8-facebook-48.png",
        path: "./assets/icons8-facebook-48.png",
        cid: "facebookLogo",
      },
      {
        filename: "icons8-x-50.png",
        path: "./assets/icons8-x-50.png",
        cid: "twiiterLogo",
      },
      {
        filename: "icons8-linkedin-logo-48.png",
        path: "./assets/icons8-linkedin-logo-48.png",
        cid: "linkedinLogo",
      },
    ],
  };

  // Send the email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Error sending email",
        error: err.message,
      });
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json({
        success: true,
        message: "Email sent successfully!",
        data: info.response,
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
