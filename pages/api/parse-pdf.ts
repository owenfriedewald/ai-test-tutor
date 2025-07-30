// pages/api/parse-pdf.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: { bodyParser: false },
};

// Wrap formidable parsing in a promise, dynamically import to avoid bundling issues
async function parseForm(req: NextApiRequest): Promise<{ filepath: string }> {
  const { IncomingForm } = await import('formidable');
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true });
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);
      const fileField = (files as any).file;
      if (!fileField) return reject(new Error('No file uploaded'));
      const file = Array.isArray(fileField) ? fileField[0] : fileField;
      resolve({ filepath: file.filepath });
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
    const fs = await import('fs');
    const buffer = fs.readFileSync(filepath as string);

    // Use pdf-parse to extract text
    const pdf = await import('pdf-parse');
    const data = await pdf.default(buffer);

    return res.status(200).json({ text: data.text });
  } catch (err: any) {
    console.error('📄 parse-pdf error:', err);
    return res
      .status(500)
      .json({ error: err.message || 'PDF parsing failed on the server' });
  }
}
