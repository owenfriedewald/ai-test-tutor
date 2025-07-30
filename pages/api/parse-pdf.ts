// pages/api/parse-pdf.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Files, File } from 'formidable';

export const config = {
  api: { bodyParser: false },
};

// Define proper return type for the parseForm function
interface ParseFormResult {
  filepath: string;
}

// Wrap formidable parsing in a promise, dynamically import to avoid bundling issues
async function parseForm(req: NextApiRequest): Promise<ParseFormResult> {
  const formidable = await import('formidable');
  const form = new formidable.IncomingForm({ keepExtensions: true });
  
  return new Promise<ParseFormResult>((resolve, reject) => {
    form.parse(req, (err, _fields, files: Files) => {
      if (err) return reject(err);
      
      // Type the file properly
      const fileField = files.file as File | File[] | undefined;
      
      if (!fileField) return reject(new Error('No file uploaded'));
      
      // Handle both single file and array cases
      const file = Array.isArray(fileField) ? fileField[0] : fileField;
      
      // Access the filepath safely
      const filepath = file.filepath || (file as any).path;
      
      if (!filepath) {
        return reject(new Error('Could not determine file path'));
      }
      
      resolve({ filepath });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { filepath } = await parseForm(req);
    
    // Use Node fs to read the file buffer
    const fs = await import('fs/promises');
    const buffer = await fs.readFile(filepath);

    // Use pdf-parse to extract text
    const pdfParse = await import('pdf-parse');
    const data = await pdfParse.default(buffer);

    return res.status(200).json({ text: data.text });
  } catch (err: unknown) {
    console.error('📄 parse-pdf error:', err);
    const errorMessage = err instanceof Error ? err.message : 'PDF parsing failed on the server';
    return res.status(500).json({ error: errorMessage });
  } finally {
    // Clean up temporary file if needed
    try {
      const { filepath } = await parseForm(req);
      const fs = await import('fs/promises');
      await fs.unlink(filepath).catch(() => {});
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}
