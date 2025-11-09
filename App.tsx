
import React, { useState, useRef, useCallback } from 'react';
import { fileToBase64 } from './utils/fileUtils';
import { extractTextFromImage } from './services/geminiService';

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const ExtractIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
          setError('Invalid file type. Please upload an image file.');
          setSelectedFile(null);
          setImagePreview(null);
          setExtractedText('');
          return;
      }
      setSelectedFile(file);
      setError(null);
      setExtractedText('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleExtractText = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setExtractedText('');

    try {
      const base64Image = await fileToBase64(selectedFile);
      const result = await extractTextFromImage(selectedFile.type, base64Image);
      if (result.startsWith('Error')) {
        setError(result);
      } else {
        setExtractedText(result);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`Failed to extract text: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const handleDownloadText = () => {
    if (!extractedText) return;

    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = selectedFile?.name.split('.').slice(0, -1).join('.') || 'extracted-text';
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white">
            Document Text Extractor
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
            Upload an image and let AI extract the text for you.
          </p>
        </header>

        <main className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* File Upload Section */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center h-96 transition-colors duration-300">
              {imagePreview ? (
                <img src={imagePreview} alt="Selected document preview" className="max-w-full max-h-full object-contain rounded-lg"/>
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400">
                   <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <p className="mt-2 font-semibold">Image Preview</p>
                  <p className="text-sm">Your uploaded document will appear here.</p>
                </div>
              )}
            </div>

            {/* Extracted Text Section */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 h-96 flex flex-col">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Extracted Text</h2>
                <textarea
                    readOnly
                    value={extractedText}
                    placeholder="Extracted text will be displayed here..."
                    className="w-full flex-grow bg-transparent border-none focus:ring-0 resize-none text-slate-600 dark:text-slate-300 p-2"
                />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={handleUploadClick}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-800"
            >
              <UploadIcon />
              {selectedFile ? 'Change Document' : 'Upload Document'}
            </button>

            <button
              onClick={handleExtractText}
              disabled={!selectedFile || isLoading}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
            >
              {isLoading ? <><SpinnerIcon /> Extracting...</> : <><ExtractIcon /> Extract Text</>}
            </button>

            <button
              onClick={handleDownloadText}
              disabled={!extractedText}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800"
            >
              <DownloadIcon />
              Download .txt
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
