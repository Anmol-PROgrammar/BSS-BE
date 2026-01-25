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
  const { name, email, message } = req.body;

  // Read HTML template file
  let template = fs.readFileSync(
    path.join(__dirname, "View", "emailTemplate.html"),
    "utf-8",
  );

  //  Replace placeholders with dynamic data
  template = template.replace("{{name}}", name).replace("{{message}}", message);

  // Configure the mailoptions object
  let mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: email, // Recipient email (user)
    bcc: "anmolrawatdgs@gmail.com", // Owner hidden in BCC
    subject: "Welcome!", // Email subject
    html: template, // Final HTML body
    attachments: [
      {
        filename: "logo.png", // File name of image
        path: "./assets/android-chrome-192x192.png", // Path to image file
        cid: "logoImage", // Must match cid in HTML
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
