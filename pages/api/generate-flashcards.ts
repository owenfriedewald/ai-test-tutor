import type { NextApiRequest, NextApiResponse } from 'next';

interface Flashcard {
  question: string;
  answer: string;
}

interface ApiResponse {
  flashcards: Flashcard[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      flashcards: [],
      error: 'Method not allowed' 
    });
  }

  const { college, professor, course, semester, content } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ 
      flashcards: [],
      error: 'Content is required' 
    });
  }

  try {
    const prompt = `Based on the following course material, create exactly 10 flashcards that would be most useful for studying. Each flashcard should have a clear, concise question and a comprehensive answer.

Course Context:
- Course: ${course || 'N/A'}
- Professor: ${professor || 'N/A'}
- School: ${college || 'N/A'}
- Semester: ${semester || 'N/A'}

Course Material:
${content}

Create 10 flashcards that cover the most important concepts, definitions, formulas, or key points from this material. Focus on information that students would likely be tested on.

Respond with ONLY a valid JSON array in this exact format:
[
  {
    "question": "What is...?",
    "answer": "The answer is..."
  },
  {
    "question": "How do you calculate...?",
    "answer": "To calculate... you..."
  }
]

Make sure each question is clear and each answer is comprehensive but concise (1-3 sentences). Return only the JSON array, no other text.`;

    // Replace with your actual API call - this example uses OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Create study flashcards based on course material. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let flashcards: Flashcard[] = [];
    try {
      // Clean the response - remove any markdown formatting
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedCards = JSON.parse(cleanedResponse);
      
      // Validate and clean the flashcards
      if (Array.isArray(parsedCards)) {
        flashcards = parsedCards
          .filter(card => card && typeof card.question === 'string' && typeof card.answer === 'string')
          .map(card => ({
            question: card.question.trim().substring(0, 200),
            answer: card.answer.trim().substring(0, 500)
          }))
          .slice(0, 10); // Ensure max 10 cards
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      
      // Fallback: Try to extract Q&A pairs with regex
      flashcards = extractFlashcardsWithRegex(aiResponse);
    }

    // If we don't have enough flashcards, create some generic ones based on content
    if (flashcards.length < 3) {
      flashcards = generateFallbackFlashcards(content, course);
    }

    return res.status(200).json({ flashcards });

  } catch (error) {
    console.error('Error generating flashcards:', error);
    
    // Fallback to basic flashcards
    try {
      const fallbackCards = generateFallbackFlashcards(content, course);
      return res.status(200).json({ flashcards: fallbackCards });
    } catch (fallbackError) {
      console.error('Fallback generation also failed:', fallbackError);
      return res.status(500).json({ 
        flashcards: [],
        error: 'Failed to generate flashcards' 
      });
    }
  }
}

// Fallback regex-based extraction
function extractFlashcardsWithRegex(text: string): Flashcard[] {
  const flashcards: Flashcard[] = [];
  
  // Try to find Q&A patterns
  const patterns = [
    /(?:Question|Q):\s*(.+?)\s*(?:Answer|A):\s*(.+?)(?=\n|$)/gi,
    /"question":\s*"([^"]+)"\s*,\s*"answer":\s*"([^"]+)"/gi,
    /(\d+)\.\s*(.+?)\s*[-–—]\s*(.+?)(?=\n\d+\.|$)/gi
  ];
  
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && (match[2] || match[3])) {
        flashcards.push({
          question: match[1].trim(),
          answer: (match[2] || match[3]).trim()
        });
      }
    }
    if (flashcards.length >= 5) break;
  }
  
  return flashcards.slice(0, 10);
}

// Generate basic flashcards when AI fails
function generateFallbackFlashcards(content: string, course?: string): Flashcard[] {
  const fallbackCards: Flashcard[] = [];
  
  // Extract key terms and concepts
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keywords = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  
  // Create basic definition flashcards
  const uniqueKeywords = [...new Set(keywords)].slice(0, 5);
  uniqueKeywords.forEach(keyword => {
    const contextSentence = sentences.find(s => s.includes(keyword));
    if (contextSentence) {
      fallbackCards.push({
        question: `What is ${keyword}?`,
        answer: contextSentence.trim() + '.'
      });
    }
  });
  
  // Add some generic course questions
  if (course) {
    fallbackCards.push({
      question: `What are the main topics covered in ${course}?`,
      answer: "Based on the provided material, this course covers various important concepts and principles that are essential for understanding the subject matter."
    });
  }
  
  // Ensure we have at least a few cards
  while (fallbackCards.length < 3 && sentences.length > 0) {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    const words = sentence.trim().split(' ');
    if (words.length > 5) {
      const question = `Complete this statement: ${words.slice(0, Math.ceil(words.length / 2)).join(' ')}...`;
      const answer = sentence.trim() + '.';
      fallbackCards.push({ question, answer });
    }
  }
  
  return fallbackCards.slice(0, 10);
}