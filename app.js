require("dotenv").config({ quiet: true });

const cors = require("cors");
const express = require("express");
const MailComposer = require("nodemailer/lib/mail-composer"); // only for building raw message
const { google } = require("googleapis");

const fs = require("fs");
const path = require("path");

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

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// Gmail API client (HTTP, not SMTP)
const gmail = google.gmail({ version: "v1", auth: oauth2Client });

// Define route to handle form submission
app.post("/send-email", async (req, res) => {
  const { FullName, EmailId, PhoneNumber, Message } = req.body;

  let template = fs.readFileSync(
    path.join(__dirname, "View", "emailTemplate.html"),
    "utf-8",
  );

  template = template
    .replace("{{fullName}}", FullName)
    .replace("{{fullName}}", FullName)
    .replace("{{email}}", EmailId)
    .replace("{{phoneNumber}}", PhoneNumber)
    .replace("{{message}}", Message);

  const mailOptions = {
    from: `Black Shadow Security <${process.env.GMAIL_USER}>`,
    to: EmailId,
    bcc: process.env.EMAIL_OWNER,
    subject: `Thanks for reaching out, ${FullName}`,
    html: template,
    textEncoding: "base64",
    attachments: [
      {
        filename: "android-chrome-192x192.png",
        path: "./assets/android-chrome-192x192.png",
        cid: "logo",
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

  try {
    // Build raw MIME message using MailComposer, then send via Gmail HTTP API
    const mail = new MailComposer(mailOptions);
    const message = await mail.compile().build();
    const rawMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: rawMessage },
    });

    console.log("Email sent successfully:", result.data.id);
    res.status(200).json({
      success: true,
      message: "Email sent successfully!",
      data: result.data.id,
    });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({
      success: false,
      message: "Error sending email",
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
