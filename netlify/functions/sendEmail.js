export async function handler(event, context) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const data = JSON.parse(event.body || '{}');
    const to = process.env.TO_EMAIL || 'thegrodept@gmail.com';
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { statusCode: 500, body: 'Missing RESEND_API_KEY' };
    const subject = `New consultation request from ${data.name || 'Website'}`;
    const text = `Name: ${data.name || ''}
Email: ${data.email || ''}
Message: ${data.message || ''}`;
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Growth Dept <onboarding@resend.dev>',
        to: [to],
        subject,
        text
      })
    });
    if (!resp.ok) return { statusCode: 500, body: 'Email send failed' };
    return { statusCode: 200, body: 'OK' };
  } catch (e) {
    return { statusCode: 500, body: 'Server error: ' + e.message };
  }
}
