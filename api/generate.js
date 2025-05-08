import fetch from 'node-fetch';

export default async function handler(req, res) {
  console.log("API endpoint hit");

  res.setHeader("Access-Control-Allow-Origin", "https://thepearlgirl.art");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { imageBase64 } = req.body;

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: 'db21e45b-f2bc-46f3-a1c7-5b2e6634fdb9',
      input: {
        image: imageBase64,
        prompt: 'Pixar style 3D cartoon character, stylized soft fur, big expressive eyes, smooth features, simplified texture, rounded nose and face, warm lighting, rendered like Disney or Pixar movie',
        negative_prompt: 'realistic fur, photorealistic, blurry texture, lowres, deformities',
        guidance_scale: 8.5,
        prompt_strength: 0.7,
        high_noise_frac: 0.4,
        lora_scale: 0.85
      }
    })
  });

  const prediction = await response.json();

  let result;
  while (!result) {
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      }
    });
    const data = await poll.json();
    if (data.status === 'succeeded') {
      result = data.output[0];
    } else if (data.status === 'failed') {
      return res.status(500).json({ error: 'Generation failed' });
    } else {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  res.status(200).json({ image: result });
}
