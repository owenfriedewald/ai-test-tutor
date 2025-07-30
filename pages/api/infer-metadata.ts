import type { NextApiRequest, NextApiResponse } from 'next';

interface InferredMetadata {
  course?: string;
  professor?: string;
  school?: string;
  semester?: string;
}

interface ApiResponse {
  metadata: InferredMetadata;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      metadata: {},
      error: 'Method not allowed' 
    });
  }

  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ 
      metadata: {},
      error: 'Content is required' 
    });
  }

  try {
    // Use first 1000 characters for inference
    const contentPreview = content.substring(0, 1000);

    const prompt = `Analyze the following document excerpt and extract metadata in JSON format. Look for course information, professor/instructor names, school/university names, and semester/term information. Return ONLY a valid JSON object with these fields: course, professor, school, semester. If any field is not found, omit it from the response.

Document excerpt:
${contentPreview}

Respond with only the JSON object:`;

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
            content: 'You are a metadata extraction assistant. Extract course, professor, school, and semester information from academic documents. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.1,
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
    let metadata: InferredMetadata = {};
    try {
      // Clean the response - remove any markdown formatting
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      metadata = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      
      // Fallback: Try to extract information using regex patterns
      metadata = extractMetadataWithRegex(contentPreview);
    }

    // Clean and validate the metadata
    const cleanedMetadata: InferredMetadata = {};
    
    if (metadata.course && typeof metadata.course === 'string') {
      cleanedMetadata.course = metadata.course.trim().substring(0, 100);
    }
    
    if (metadata.professor && typeof metadata.professor === 'string') {
      cleanedMetadata.professor = metadata.professor.trim().substring(0, 100);
    }
    
    if (metadata.school && typeof metadata.school === 'string') {
      cleanedMetadata.school = metadata.school.trim().substring(0, 100);
    }
    
    if (metadata.semester && typeof metadata.semester === 'string') {
      cleanedMetadata.semester = metadata.semester.trim().substring(0, 50);
    }

    return res.status(200).json({ metadata: cleanedMetadata });

  } catch (error) {
    console.error('Error inferring metadata:', error);
    
    // Fallback to regex extraction if AI fails
    try {
      const fallbackMetadata = extractMetadataWithRegex(content.substring(0, 1000));
      return res.status(200).json({ metadata: fallbackMetadata });
    } catch (fallbackError) {
      console.error('Fallback extraction also failed:', fallbackError);
      return res.status(500).json({ 
        metadata: {},
        error: 'Failed to infer metadata' 
      });
    }
  }
}

// Fallback regex-based extraction
function extractMetadataWithRegex(content: string): InferredMetadata {
  const metadata: InferredMetadata = {};
  
  // Course patterns (e.g., "CS 1050", "MATH-101", "Biology 200")
  const coursePatterns = [
    /(?:course|class|subject)[:.\s]*([A-Z]{2,4}[-\s]?\d{2,4}[A-Z]?)/i,
    /\b([A-Z]{2,4}[-\s]?\d{2,4}[A-Z]?)\b/g,
    /(?:^|\n)([A-Z]{2,5}\s+\d{3,4})/m
  ];
  
  for (const pattern of coursePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      metadata.course = match[1].trim();
      break;
    }
  }
  
  // Professor patterns
  const professorPatterns = [
    /(?:professor|prof|instructor|dr|teacher)[:.\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(?:taught by|instructor|by)[:.\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];
  
  for (const pattern of professorPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      metadata.professor = `Dr. ${match[1].trim()}`;
      break;
    }
  }
  
  // School patterns
  const schoolPatterns = [
    /(?:university|college|institute|school)(?:\s+of)?[\s:]*([A-Z][a-zA-Z\s]+(?:University|College|Institute|School))/i,
    /([A-Z][a-zA-Z\s]*(?:University|College|Institute|School))/i
  ];
  
  for (const pattern of schoolPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      metadata.school = match[1].trim();
      break;
    }
  }
  
  // Semester patterns
  const semesterPatterns = [
    /(Fall|Spring|Summer|Winter)\s+(\d{4})/i,
    /(Semester|Term)\s+(\d+)/i,
    /(\d{4})\s+(Fall|Spring|Summer|Winter)/i
  ];
  
  for (const pattern of semesterPatterns) {
    const match = content.match(pattern);
    if (match) {
      if (match[1] && match[2]) {
        metadata.semester = `${match[1]} ${match[2]}`;
      } else if (match[2] && match[1]) {
        metadata.semester = `${match[2]} ${match[1]}`;
      }
      break;
    }
  }
  
  return metadata;
}