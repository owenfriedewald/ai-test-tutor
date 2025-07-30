import React, { useState, useCallback } from 'react';

// Pure function to upload and parse PDF via your Next.js API route
async function parsePDFContent(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/parse-pdf', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    // Attempt to parse error message, fallback to generic
    let errorMsg = 'Server error parsing PDF';
    try {
      const json = await res.json();
      errorMsg = json.error || errorMsg;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(errorMsg);
  }

  const { text } = await res.json();
  return text;
}

interface PDFUploaderProps {
  onPDFParsed: (text: string) => void;
  onError: (error: string) => void;
}

export function PDFUploader({ onPDFParsed, onError }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Wrap parsePDFContent to manage loading state
  const parsePDF = useCallback(async (file: File): Promise<string> => {
    setIsProcessing(true);
    try {
      return await parsePDFContent(file);
    } catch (err) {
      console.error('PDF parsing error:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      onError('Please upload a PDF file only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB.');
      return;
    }

    try {
      setUploadedFileName(file.name);
      const extractedText = await parsePDF(file);

      if (extractedText.length < 10) {
        onError('Could not extract text from PDF. The file might be image-based or corrupted.');
        setUploadedFileName(null);
        return;
      }

      onPDFParsed(extractedText);
    } catch (err: any) {
      onError(err.message || 'Failed to process PDF');
      setUploadedFileName(null);
    }
  }, [onPDFParsed, onError, parsePDF]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const clearFile = () => {
    setUploadedFileName(null);
    onPDFParsed('');
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && document.getElementById('pdf-input')?.click()}
      >
        <input
          id="pdf-input"
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="text-center">
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-400">Processing PDF...</p>
            </div>
          ) : uploadedFileName ? (
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-800 dark:text-gray-200 font-medium">{uploadedFileName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">PDF processed successfully</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-800 dark:text-gray-200 font-medium">Upload PDF Document</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Drag and drop or click to browse (Max 10MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
