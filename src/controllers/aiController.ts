import { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { AuthRequest } from '../middlewares/authMiddleware';

// POST /api/ai/analyze
export const analyzeJobDescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      res.status(503).json({ error: 'AI feature is not configured on this server.' });
      return;
    }

    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 30) {
      res.status(400).json({ error: 'Please provide a job description (at least 30 characters).' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a career advisor. Analyze the following job description and return a JSON response with exactly this structure:

{
  "summary": "2-3 sentence summary of the role",
  "requiredSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "preparationTopics": ["topic1", "topic2", "topic3", "topic4"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "interviewQuestions": ["question1?", "question2?", "question3?"]
}

Job Description:
${jobDescription.trim()}

Return ONLY valid JSON. No markdown, no explanation.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text?.trim() ?? '';

    // Strip markdown code blocks if present
    const clean = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      res.status(500).json({ error: 'AI returned an unexpected response. Please try again.' });
      return;
    }

    res.status(200).json({ result: parsed });
  } catch (error: any) {
    console.error('AI analyze error:', error?.message || error);
    res.status(500).json({ error: 'AI analysis failed. Please try again later.' });
  }
};
