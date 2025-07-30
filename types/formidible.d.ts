// Create this file: types/formidable.d.ts
declare module 'formidable' {
  export interface File {
    filepath: string;
    originalFilename: string;
    mimetype: string;
    size: number;
    hashAlgorithm: boolean | string;
    hash: any;
    toJSON(): Object;
  }

  export interface Files {
    [key: string]: File | File[];
  }

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface Options {
    keepExtensions?: boolean;
    maxFiles?: number;
    maxFileSize?: number;
    maxFields?: number;
    maxTotalFileSize?: number;
    allowEmptyFiles?: boolean;
    multiples?: boolean;
    [key: string]: any;
  }

  export class IncomingForm {
    constructor(options?: Options);
    parse(
      req: any, 
      callback: (err: any, fields: Fields, files: Files) => void
    ): void;
  }
}

// Create this file: types/pdf-parse.d.ts
declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsXFAPresent: boolean;
      [key: string]: any;
    };
    metadata: any;
    version: string;
  }

  function PDFParse(dataBuffer: Buffer, options?: any): Promise<PDFData>;
  
  export default PDFParse;
}