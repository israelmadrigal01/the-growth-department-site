export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const to = process.env.TO_EMAIL || 'thegrodept@gmail.com';
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { statusCode: 500, body: 'Missing RESEND_API_KEY' };

    const payload = {
      from: 'Growth Dept <onboarding@resend.dev>', // works for testing
      to: [to],
      subject: `New consultation request from ${data.name || 'Website'}`,
      text: `Name: ${data.name || ''}
Email: ${data.email || ''}
Message: ${data.message || ''}`,
      // Helps replies go to the person who filled the form
      reply_to: data.email ? [data.email] : undefined,
    };

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text(); // <- capture Resend's error
    if (!resp.ok) {
      console.log('Resend error', resp.status, text);
      return { statusCode: resp.status, body: text || 'Email send failed' };
    }

    return { statusCode: 200, body: 'OK' };
  } catch (e) {
    console.log('Function error:', e);
    return { statusCode: 500, body: 'Server error: ' + e.message };
  }
}
