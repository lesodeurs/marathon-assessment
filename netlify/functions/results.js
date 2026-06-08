const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  // Simple password protection
  const token = event.queryStringParameters?.token;
  if (token !== process.env.ADMIN_TOKEN) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const store = getStore('assessments');
    const { blobs } = await store.list();

    const results = await Promise.all(
      blobs.map(async ({ key }) => {
        const data = await store.get(key, { type: 'json' });
        return data;
      })
    );

    // Sort newest first
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: results.length, results })
    };

  } catch (err) {
    console.error('Results error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch results.' })
    };
  }
};
