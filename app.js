require("dotenv").config({ quiet: true });

const express = require("express");

// Import the Nodemailer library
const nodemailer = require("nodemailer");

const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

// Create a transporter object
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use false for STARTTLS; true for SSL on port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Define route to handle form submission
app.post("/send-email", (req, res) => {
  // Extract form data from request body
  const { fullName, email, phoneNumber, message } = req.body;

  // Read HTML template file
  let template = fs.readFileSync(
    path.join(__dirname, "View", "emailTemplate.html"),
    "utf-8",
  );

  //  Replace placeholders with dynamic data
  template = template
    .replace("{{fullName}}", fullName)
    .replace("{{fullName}}", fullName)
    .replace("{{email}}", email)
    .replace("{{phoneNumber}}", phoneNumber)
    .replace("{{message}}", message);

  // Configure the mailoptions object
  let mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: email, // Recipient email (user)
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
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.send("Email sent successfully!");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
