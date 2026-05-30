module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return res.json({ ok: true });
  }

  try {
    const html = `<p><strong>Name:</strong> ${name.replace(/</g, '&lt;')}</p><p><strong>Email:</strong> ${email.replace(/</g, '&lt;')}</p><hr/><p>${(message || '').replace(/\n/g, '<br/>').replace(/</g, '&lt;')}</p>`;

    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromEmail,
        to: fromEmail,
        replyTo: email,
        subject: `Contact: ${name}`,
        html,
      }),
    });

    if (!result.ok) throw new Error('Resend API error');
    return res.json({ ok: true });
  } catch (err) {
    console.error('Contact email failed:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
