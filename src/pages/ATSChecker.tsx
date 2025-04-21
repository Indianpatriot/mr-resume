
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  score: number;
  keywordMatch: {
    matched: string[];
    missing: string[];
  };
  formatIssues: string[];
  contentSuggestions: string[];
  overallFeedback: string;
  sectionFeedback?: {
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
  };
}

const ATSChecker = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide both your resume text and the job description.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await supabase.functions.invoke('ats-analyzer', {
        body: {
          resumeText,
          jobDescription
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResult(response.data);
      
      toast({
        title: "Analysis Complete",
        description: "Your resume has been analyzed against the job description.",
      });
      
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze your resume. Please try again.",
        variant: "destructive"
      });
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-8 bg-black text-white inline-block px-4 py-2 transform -rotate-1">
        ATS Checker
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-4 border-black bg-yellow-400">
              <CardTitle className="text-2xl font-bold">
                Resume & Job Description
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resumeText" className="text-lg font-bold">Paste Your Resume Text</Label>
                <Textarea
                  id="resumeText"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Copy and paste the text content of your resume here..."
                  className="border-4 border-black p-6 text-lg min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="text-lg font-bold">Paste Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Copy and paste the job description here..."
                  className="border-4 border-black p-6 text-lg min-h-[200px]"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white border-4 border-black transform hover:-rotate-1 transition-transform py-6 text-lg font-bold"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" /> 
                    Analyzing...
                  </div>
                ) : (
                  "Analyze Resume"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-4 border-black bg-blue-500">
              <CardTitle className="text-2xl font-bold text-white">
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-8 border-black border-t-pink-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium">Analyzing your resume...</p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  {/* Score */}
                  <div className="text-center">
                    <div className="inline-block bg-yellow-400 rounded-full border-8 border-black p-6">
                      <span className="text-5xl font-bold">{result.score}%</span>
                    </div>
                    <p className="mt-2 text-lg font-medium">ATS Compatibility Score</p>
                  </div>

                  {/* Keyword Matches */}
                  <div>
                    <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform -rotate-1">
                      Keyword Analysis
                    </h3>
                    
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="font-bold">Matched Keywords:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.keywordMatch.matched.map((keyword, i) => (
                            <span key={i} className="bg-green-100 border-2 border-green-600 px-2 py-0.5 text-green-800">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-bold">Missing Keywords:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.keywordMatch.missing.map((keyword, i) => (
                            <span key={i} className="bg-red-100 border-2 border-red-600 px-2 py-0.5 text-red-800">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Format Issues */}
                  <div>
                    <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform rotate-1">
                      Format Issues
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.formatIssues.map((issue, i) => (
                        <li key={i} className="text-red-600">{issue}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Content Suggestions */}
                  <div>
                    <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform -rotate-1">
                      Improvement Suggestions
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.contentSuggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Section Feedback if available */}
                  {result.sectionFeedback && (
                    <div>
                      <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform rotate-1">
                        Section Feedback
                      </h3>
                      <div className="space-y-2 mt-2">
                        {result.sectionFeedback.summary && (
                          <div>
                            <p className="font-bold">Summary:</p>
                            <p className="text-sm">{result.sectionFeedback.summary}</p>
                          </div>
                        )}
                        {result.sectionFeedback.experience && (
                          <div>
                            <p className="font-bold">Experience:</p>
                            <p className="text-sm">{result.sectionFeedback.experience}</p>
                          </div>
                        )}
                        {result.sectionFeedback.education && (
                          <div>
                            <p className="font-bold">Education:</p>
                            <p className="text-sm">{result.sectionFeedback.education}</p>
                          </div>
                        )}
                        {result.sectionFeedback.skills && (
                          <div>
                            <p className="font-bold">Skills:</p>
                            <p className="text-sm">{result.sectionFeedback.skills}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Overall Feedback */}
                  <div className="bg-gray-100 border-4 border-black p-4">
                    <h3 className="font-bold mb-1">Overall Feedback:</h3>
                    <p>{result.overallFeedback}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white border-4 border-black transform hover:-rotate-1 transition-transform">
                      Update Resume
                    </Button>
                    <Button variant="outline" className="flex-1 border-4 border-black transform hover:rotate-1 transition-transform">
                      Save Analysis
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-500">
                    Paste your resume and a job description, then click "Analyze Resume" to see your ATS compatibility score.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ATSChecker;
