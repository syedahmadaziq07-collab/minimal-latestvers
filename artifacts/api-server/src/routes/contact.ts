import { Router } from "express";
import { Resend } from "resend";

const router = Router();

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body ?? {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn("Resend not configured — logging contact message instead");
    console.log({ name, email, message });
    return res.json({ ok: true });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: fromEmail,
      replyTo: email,
      subject: `Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><hr/><p>${message.replace(/\n/g, "<br/>")}</p>`,
    });
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("Contact email failed:", err.message);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
