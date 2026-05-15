export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, mediaType } = req.body;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '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',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: image }
            },
            {
              type: 'text',
              text: 'Extract all cattle ear tag numbers from this handwritten list. Tags may look like: 19-21F4, M-63, N-5, 24-001, 19-FR2. Return ONLY a valid JSON array of strings, nothing else. Example: ["19-21F4","M-63","N-5"]'
            }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = (data.content || []).map(i => i.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const tags = JSON.parse(clean);
    
    res.status(200).json({ tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
