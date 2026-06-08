const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { head, feet, name, context, rawScores } = JSON.parse(event.body);

    const salutation = name ? `Address this person by name (${name}) in the opening sentence only.` : '';
    const contextLine = context ? `The person shared this about why they took the assessment: "${context}". Weave this context naturally into your recommendations — make it feel like the transcript was written specifically for their situation.` : '';

    const prompt = `You are an assessment interpreter for a philosophical framework called "The Marathon of Imperative Synchronization" by Brian C. Bradford. ${salutation} ${contextLine}

The framework uses a "Head vs. Feet Model" with six states:

HEAD STATES:
- Front-Heavy: arrogance, closed to other perspectives, knowledge used for self-elevation
- Back-Heavy: complacency, avoidance of growth, no identity formation, riding life's currents
- Balanced: humble, curious, shares knowledge, open to growth, uses education to serve others

FEET STATES:
- Fast-Pace: self-serving, tramples others, compromises integrity for advancement
- Slow-Pace: passive, withholds contribution, fails to act despite awareness
- Marathon-Pace: principled, consistent integrity, serves others, grounded in righteousness

The user's assessment results:
- Head State: ${head.state} (score: ${head.score}/15)
- Feet State: ${feet.state} (score: ${feet.score}/15)
- Raw subscores: Front-Heavy Head: ${rawScores.front_heavy}/15, Back-Heavy Head: ${rawScores.back_heavy}/15, Balanced Head: ${rawScores.balanced_head}/15, Fast-Pace Feet: ${rawScores.fast_pace}/15, Slow-Pace Feet: ${rawScores.slow_pace}/15, Marathon-Pace Feet: ${rawScores.marathon_pace}/15

Write a personal transcript for this individual with the following structure. Use warm, direct, literary language — not clinical. Speak to them directly (use "you"). Do not use headers or bullets. Write flowing paragraphs.

1. OPENING (2-3 sentences): Name their Head state and Feet state and what this combination means for their marathon.

2. HEAD ASSESSMENT (2-3 sentences): Describe specifically what their Head state reveals about how they engage with knowledge and others — be honest but compassionate. If Balanced, affirm it and note what to protect.

3. FEET ASSESSMENT (2-3 sentences): Describe what their Feet pace reveals about their actions, integrity, and contribution — honest and compassionate. If Marathon-Pace, affirm it.

4. SYNCHRONIZATION (2 sentences): Reflect on whether their Head and Feet are in sync, and what that means for their finish line.

5. RECOMMENDATIONS (3-4 sentences): Offer 2-3 specific, actionable things they can do — starting this week — to move toward or maintain a Balanced Head and Marathon-Pace Feet. Make these practical and grounded in the framework's language.

6. CLOSING (1-2 sentences): A brief, memorable send-off in the spirit of the framework. End with encouragement.

Keep the total response between 250 and 350 words. Do not include any headers, bullets, or formatting — plain paragraphs only.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    console.log('Claude API status:', response.status);
    console.log('Claude API response:', JSON.stringify(data).slice(0, 400));
    if (data.error) throw new Error('API error: ' + (data.error.message || JSON.stringify(data.error)));
    const text = data.content?.find(b => b.type === 'text')?.text || '';

    if (!text) throw new Error('Empty response from Claude');

    // Save to Netlify Blobs
    try {
      const store = getStore('assessments');
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await store.setJSON(id, {
        id,
        timestamp: new Date().toISOString(),
        name: name || 'Anonymous',
        context: context || '',
        head,
        feet,
        rawScores,
        transcript: text
      });
      console.log('Saved to Blobs with id:', id);
    } catch (blobErr) {
      console.error('Blob save failed (non-fatal):', blobErr);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: text })
    };

  } catch (err) {
    console.error('Transcript error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate transcript.' })
    };
  }
};
