import fetch from 'node-fetch';

export default async function handler(req, res) {
  // 👇 Dit laat verzoeken toe van jouw Shopify-domein
  res.setHeader("Access-Control-Allow-Origin", "https://thepearlgirl.art");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 👇 Behandel OPTIONS-verzoeken (preflight check)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { imageBase
