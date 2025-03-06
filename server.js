const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const app = express();
const port = 3000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const smsUrl = process.env.TWILIO_SID;
const smsApiKey = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
console.log(smsUrl);
console.log("jai");
const client = twilio(smsUrl, smsApiKey);

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const otpStore = {};

app.get("/", async (req, res) => {
  return res.send(
    "wELCOME TO THE BACKEND SERVER MR. pRASHANT, Dont loose petatience you are almost there "
  );
});
app.post("/send", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }
  const otp = generateOtp();
  const message = `Your Jio+hotsar Otp is ${otp}, Do not share it with anyone`;
  console.log(otp);
  otpStore[phone] = otp;
  console.log(otpStore);

  try {
    // Send SMS using Twilio
    const messageResponse = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: `+91${phone}`, // Add country code (e.g., +91 for India)
    });

    console.log("OTP sent successfully:", messageResponse.sid);
    return res.status(200).json({ message: `OTP sent to +91${phone}` });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
});
app.post("/validate-otp", (req, res) => {
  const { phone, otp } = req.body;
  console.log(req.body, "req body");
  console.log(`phone and otp`, phone, otp);
  if (!phone || !otp) {
    return res
      .status(400)
      .json({ message: "Phone number and OTP are required" });
  }
  const sotreOtp = otpStore[phone];
  if (sotreOtp === Number(otp)) {
    delete otpStore[phone];
    res.status(200).json({ message: "otp validation successfull" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

app.listen(port, () => {
  console.log("am running on port:", port);
});
