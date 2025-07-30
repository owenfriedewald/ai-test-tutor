import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { PageLayout } from "../components/layout";
import { Header } from "../components/sections/Header";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { TextArea } from "../components/ui/TextArea";
import { Button } from "../components/ui/Button";
import { PDFUploader } from "../components/ui/PDFUploader";
import { useDarkMode } from "../hooks/useDarkMode";

console.log({ PageLayout, Header, Card, InputField, TextArea, Button, useDarkMode });

export default function Home() {
  const [college, setCollege] = useState("");
  const [professor, setProfessor] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [content, setContent] = useState("");
  const [response, setResponse] = useState("");
  const [followUpResponse, setFollowUpResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('upload');

  const { darkMode, toggleDarkMode } = useDarkMode();

  const handlePDFParsed = (text: string) => {
    setContent(text);
    setPdfError("");
  };

  const handlePDFError = (error: string) => {
    setPdfError(error);
  };

  const clearContent = () => {
    setContent("");
    setPdfError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    setFollowUpResponse("");
    setShowFollowUp(false);
    setIsTransitioning(true);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ college, professor, course, semester, content }),
      });
      const data = await res.json();
      
      setTimeout(() => {
        setResponse(data.result);
        setShowFollowUp(true);
        setIsTransitioning(false);
      }, 300);
      
    } catch (error) {
      console.error("Error generating study help:", error);
      setResponse("Sorry, there was an error generating your study help. Please try again.");
      setIsTransitioning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async (followUpType: string) => {
    setFollowUpLoading(true);
    setShowFollowUp(false);
    setFollowUpResponse("");
    
    try {
      const prompts = {
        "Practice Questions": "Given the previous message you sent, generate practice questions for the user in under 250 tokens",
        "Explain key formulas": "Given the previous message you sent, explain key formulas for the user in under 250 tokens",
        "Placeholder": "Given the previous message you sent, provide additional study tips for the user in under 250 tokens"
      };
      
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          college, professor, course, semester,
          content: prompts[followUpType as keyof typeof prompts],
          maxTokens: 250
        }),
      });
      const data = await res.json();
      setFollowUpResponse(data.result);
    } catch (error) {
      console.error("Error generating follow-up:", error);
      setFollowUpResponse("Sorry, there was an error generating the follow-up response.");
    } finally {
      setFollowUpLoading(false);
    }
  };

  return (
    <PageLayout darkMode={darkMode} onToggleDarkMode={toggleDarkMode}>
      <Header 
        title="AI Test Tutor"
        subtitle="Transform your study materials into personalized tutoring sessions. Upload your syllabus, practice tests, or study guides and get tailored help."
      />

      <Card>
        <div className={`transition-all duration-500 ${response || isTransitioning ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-full'}`}>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  placeholder="🏫 College or University"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  maxLength={100}
                />
                <InputField
                  placeholder="👨‍🏫 Professor Name"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  maxLength={100}
                />
                <InputField
                  placeholder="📚 Course Name"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  maxLength={100}
                />
                <InputField
                  placeholder="📅 Semester (e.g., Fall 2024)"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'upload'
                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  📄 Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'paste'
                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  📝 Paste Text
                </button>
              </div>

              <div className="min-h-[200px]">
                {activeTab === 'upload' ? (
                  <div className="space-y-4">
                    <PDFUploader 
                      onPDFParsed={handlePDFParsed}
                      onError={handlePDFError}
                    />
                    {pdfError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 text-sm">{pdfError}</p>
                      </div>
                    )}
                    {content && activeTab === 'upload' && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-green-600 dark:text-green-400 text-sm font-medium mb-2">
                          ✅ PDF content extracted successfully
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {content.length} characters extracted. You can now generate your study help or switch to the "Paste Text" tab to view/edit the content.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <TextArea
                      placeholder="📄 Paste your syllabus, practice exam, study guide, or course details here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={12000}
                    />
                    {content && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={clearContent}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          Clear content
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                loading={loading} 
                className="w-full"
                disabled={!content.trim()}
              >
                {loading ? (
                  "Generating Your Study Plan..."
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate My Study Help
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {(loading && !response) && (
          <Card className="mt-6 flex justify-center items-center min-h-[300px]">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full" />
              <p className="text-gray-600 dark:text-gray-400">Analyzing your content and generating your plan...</p>
            </div>
          </Card>
        )}

        {response && (
          <Card className="mt-6">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Your Personalized Study Plan</h2>
                <button
                  onClick={() => {
                    setResponse("");
                    setFollowUpResponse("");
                    setShowFollowUp(false);
                    setIsTransitioning(false);
                  }}
                  className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200 text-sm"
                >
                  New Question
                </button>
              </div>

              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-lg min-h-[520px] max-h-[650px] overflow-y-auto">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              </div>

              {followUpResponse && (
                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Additional Help</h3>
                  </div>
                  <div className="bg-purple-50/70 dark:bg-purple-900/20 backdrop-blur-sm rounded-2xl border border-purple-200/50 dark:border-purple-700/50 p-6 shadow-lg">
                    <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                      <ReactMarkdown>{followUpResponse}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {(showFollowUp || followUpLoading) && (
                <div className="mt-6">
                  {followUpLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-3">
                        <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Generating additional content...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">What do you want specifically?</p>
                      <div className="flex flex-wrap gap-3">
                        {["Practice Questions", "Explain key formulas", "Placeholder"].map((option) => (
                          <Button
                            key={option}
                            onClick={() => handleFollowUp(option)}
                            className="px-4 py-2 text-sm"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </Card>

      <div className="text-center mt-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Powered by AI • Designed for student success • Built with ❤️
        </p>
      </div>
    </PageLayout>
  );
}