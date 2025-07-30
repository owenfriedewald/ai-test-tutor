// pages/api/generate.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { college, professor, course, semester, content } = req.body;

  if (!content || !college || !professor || !course || !semester) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const prompt = `
You are a world-class academic tutor. Based on the following course details, generate a personalized study guide with tutoring advice, suggested focus areas, and possibly some sample practice problems. Be concise but detailed.

College: ${college}
Professor: ${professor}
Course: ${course}
Semester: ${semester}
Content Provided:
${content}
    `.trim();

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await completion.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Invalid response from OpenAI" });
    }

    return res.status(200).json({ result: data.choices[0].message.content });
  } catch (err) {
    console.error("Error in GPT route:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
