exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, headState, feetState } = JSON.parse(event.body);

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: name,
          HEAD_STATE: headState,
          FEET_STATE: feetState
        },
        listIds: [parseInt(process.env.BREVO_LIST_ID) || 1],
        updateEnabled: true
      })
    });

    // 201 = created, 204 = updated (already exists) — both are success
    if (response.status === 201 || response.status === 204) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    const data = await response.json();
    console.error('Brevo error:', data);
    // Don't block the user — just log and continue
    return { statusCode: 200, body: JSON.stringify({ success: false, reason: data.message }) };

  } catch (err) {
    console.error('Subscribe error:', err);
    // Non-blocking — user still gets results
    return { statusCode: 200, body: JSON.stringify({ success: false }) };
  }
};
