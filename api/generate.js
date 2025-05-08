import fetch from 'node-fetch';

export default async function handler(req, res) {
  console.log("✅ API endpoint hit");

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
  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  console.log("📤 Sending request to Replicate...");

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: '81f8bbd3463056c8521eb528feb10509cc1385e2fabef590747f159848589048',
      input: {
        image: imageBase64,
        prompt: 'Pixar style 3D portrait of a person or animal, clean background, ultra high detail, expressive features, large eyes, smooth skin or fur, realistic proportions, friendly look, cinematic lighting, accurate facial details, subtle texture, Disney Pixar animation style',
negative_prompt: 'exaggerated cartoon, surreal, low resolution, blurry, distorted features, unrealistic anatomy, creepy, extra limbs',
guidance_scale: 6.5,
prompt_strength: 0.45,
high_noise_frac: 0.3,
lora_scale: 0.7

      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("❌ Replicate request failed:", errText);
    return res.status(500).json({ error: 'Replicate request failed', detail: errText });
  }

  const prediction = await response.json();
  console.log("✅ Prediction started:", prediction.id);

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
