
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ATSForm } from "@/components/ats-checker/ATSForm";
import { ATSResults } from "@/components/ats-checker/ATSResults";

export interface AnalysisResult {
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

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-8 bg-black text-white inline-block px-4 py-2 transform -rotate-1">
        ATS Checker
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ATSForm
          resumeText={resumeText}
          setResumeText={setResumeText}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
          setResult={setResult}
          toast={toast}
        />

        <ATSResults
          isAnalyzing={isAnalyzing}
          result={result}
        />
      </div>
    </div>
  );
};

export default ATSChecker;
