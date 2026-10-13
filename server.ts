import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '20mb' }));

// Shared GoogleGenAI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. AI Tutor Endpoint
app.post('/api/tutor/explain', async (req, res) => {
  try {
    const { topic, mode = 'simple_student', subject = 'General', question = '' } = req.body;

    if (!topic && !question) {
      return res.status(400).json({ error: 'Please provide a topic or question to explain.' });
    }

    let instruction = '';
    if (mode === 'eli5') {
      instruction = `You are Smart Study Buddy, an expert tutor for college students. Explain the topic like the student is completely new to it (ELI5 style). Use vivid real-world analogies, humor, relatable college life examples, and break down complex concepts into 3 clear steps. End with a "Quick Check" 1-question quiz to test understanding.`;
    } else if (mode === 'exam_master') {
      instruction = `You are Smart Study Buddy, a top university professor and exam coach. Explain this topic with maximum exam utility: formal definition made intuitive, high-yield points, common exam traps/misconceptions, step-by-step problem breakdown, and a sample exam question with solution.`;
    } else {
      instruction = `You are Smart Study Buddy, a friendly and clear peer tutor for college students. Explain this topic clearly and concisely. Highlight:
1. What it is in plain English
2. Why it matters (The big picture intuition)
3. Key Components or Steps (bullet points)
4. A memorable analogy
5. Key Takeaway summary.`;
    }

    const prompt = `Subject Area: ${subject}
Topic/Question: ${topic || question}
Additional student question/details: ${question || 'Explain the concept thoroughly and simply.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: instruction,
        temperature: 0.7,
      },
    });

    const explanation = response.text || 'Unable to generate explanation. Please try again.';
    res.json({ explanation, mode, topic });
  } catch (err: any) {
    console.error('Error in /api/tutor/explain:', err);
    res.status(500).json({
      error: 'Failed to generate explanation',
      details: err?.message || 'Server error',
      fallback: `Here is a quick study guide for "${req.body?.topic || 'your topic'}": Focus on the core definition, write out the key formulas/mechanisms, test yourself with active recall, and connect it to a real-world scenario.`
    });
  }
});

// 2. Quiz Generator Endpoint
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { topic, numQuestions = 5, difficulty = 'Medium', notesText = '' } = req.body;

    const prompt = `Generate a ${numQuestions}-question multiple choice practice quiz for college students.
Topic: ${topic}
Difficulty Level: ${difficulty}
${notesText ? `Base the quiz primarily on these notes/text: """${notesText.slice(0, 5000)}"""` : ''}

Make sure questions test deep conceptual understanding, not just rote memorization. Each question must have 4 clear distinct options (A, B, C, D), the index of the correct answer (0, 1, 2, or 3), and an instructive explanation of why the correct answer is right and why others are wrong.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a college exam creator. Output strict JSON with high-quality practice quiz questions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  conceptTag: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'topic', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/quiz/generate:', err);
    res.status(500).json({
      error: 'Failed to generate quiz',
      details: err?.message || 'Server error',
    });
  }
});

// 3. PDF / Notes Summarizer Endpoint
app.post('/api/summarize/notes', async (req, res) => {
  try {
    const { content, title = 'Document Notes', format = 'executive' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide note text or extract text to summarize.' });
    }

    const prompt = `Analyze and summarize the following study notes/lecture text:
Title: ${title}
Content: """${content.slice(0, 15000)}"""

Provide a high-yield study sheet for college revision.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic summarization engine for college students. Distill long materials into clear, high-yield review notes. Return JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            executiveSummary: { type: Type.STRING, description: '2-3 sentences overview of core idea' },
            estimatedReadingMinutes: { type: Type.INTEGER },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '5-7 bullet points of high-yield concepts',
            },
            keyTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            likelyExamQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  briefAnswer: { type: Type.STRING },
                },
                required: ['question', 'briefAnswer'],
              },
            },
          },
          required: ['title', 'executiveSummary', 'keyTakeaways', 'keyTerms', 'likelyExamQuestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/summarize/notes:', err);
    res.status(500).json({
      error: 'Failed to summarize document',
      details: err?.message || 'Server error',
    });
  }
});

// 4. Study Planner Endpoint
app.post('/api/planner/generate', async (req, res) => {
  try {
    const { examName, examDate, availableHours = 3, topics = [], confidence = 'moderate' } = req.body;

    const prompt = `Create a realistic college study roadmap:
Target Exam/Goal: ${examName}
Exam Date: ${examDate}
Daily Available Hours: ${availableHours} hours
Current Confidence: ${confidence}
Key Topics/Syllabus: ${Array.isArray(topics) ? topics.join(', ') : topics}

Generate a day-by-day or phase-by-phase strategic study schedule using active recall and spaced repetition.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic advisor creating high-performance, burnout-free college exam study schedules. Return structured JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            strategyOverview: { type: Type.STRING },
            recommendedPomodoroFormat: { type: Type.STRING },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayOrWeek: { type: Type.STRING },
                  focusTopic: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  reviewTechnique: { type: Type.STRING },
                  estimatedMinutes: { type: Type.INTEGER },
                },
                required: ['dayOrWeek', 'focusTopic', 'tasks'],
              },
            },
            proStudyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['planTitle', 'strategyOverview', 'milestones', 'proStudyTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/planner/generate:', err);
    res.status(500).json({
      error: 'Failed to generate study plan',
      details: err?.message || 'Server error',
    });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Smart Study Buddy Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
