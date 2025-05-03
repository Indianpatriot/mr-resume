
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ATSForm } from "@/components/ats-checker/ATSForm";
import { ATSResults } from "@/components/ats-checker/ATSResults";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
  // Additional fields for database storage
  id?: string;
  createdAt?: string;
  jobTitle?: string;
}

const ATSChecker = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<AnalysisResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch saved analyses when component mounts
  useEffect(() => {
    fetchSavedAnalyses();
  }, []);

  // Function to save analysis to database
  const saveAnalysis = async (analysisResult: AnalysisResult): Promise<void> => {
    try {
      // Extract job title from the job description (first line or first sentence)
      const jobTitleMatch = jobDescription.match(/^(.+?)(?:\n|$)/);
      const jobTitle = jobTitleMatch ? jobTitleMatch[1].trim() : "Untitled Position";

      // Save to database - using the resumes table with content field for storing analysis
      // We need to ensure the content is properly formatted as a JSON object
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          title: jobTitle,
          user_id: "anonymous", // Replace with actual user ID when auth is implemented
          content: {
            type: "ats_analysis",
            result: {
              score: analysisResult.score,
              keywordMatch: analysisResult.keywordMatch,
              formatIssues: analysisResult.formatIssues,
              contentSuggestions: analysisResult.contentSuggestions,
              overallFeedback: analysisResult.overallFeedback,
              sectionFeedback: analysisResult.sectionFeedback || {}
            },
            job_description: jobDescription
          },
          ats_score: analysisResult.score
        })
        .select();

      if (error) {
        throw error;
      }

      // Add to local state
      if (data && data[0]) {
        const savedAnalysis = {
          ...analysisResult,
          id: data[0].id,
          createdAt: data[0].created_at,
          jobTitle: jobTitle
        };

        setSavedAnalyses(prev => [savedAnalysis, ...prev]);
      }
    } catch (error) {
      console.error("Error saving analysis:", error);
      throw error;
    }
  };

  // Function to fetch saved analyses from database
  const fetchSavedAnalyses = async () => {
    try {
      // For now, we fetch analyses without user ID filtering since auth isn't implemented
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq('content->>type', 'ats_analysis')
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to match our AnalysisResult interface
      const analyses = data.map(item => {
        const analysisContent = item.content as any;
        const result = analysisContent.result || {};
        
        return {
          score: result.score || 0,
          keywordMatch: result.keywordMatch || { matched: [], missing: [] },
          formatIssues: result.formatIssues || [],
          contentSuggestions: result.contentSuggestions || [],
          overallFeedback: result.overallFeedback || "",
          sectionFeedback: result.sectionFeedback || {},
          id: item.id,
          createdAt: item.created_at,
          jobTitle: item.title || "Untitled Position"
        };
      });

      setSavedAnalyses(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    }
  };

  // Function to load a saved analysis
  const loadAnalysis = (analysis: AnalysisResult) => {
    setResult(analysis);
  };

  // Function to export analysis as PDF
  const exportAnalysis = () => {
    if (!result) return;

    const element = document.getElementById('ats-results-container');
    if (!element) return;

    toast({
      title: "Exporting Analysis",
      description: "Preparing your analysis for download...",
    });

    setTimeout(() => {
      html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`ATS-Analysis-${new Date().toISOString().slice(0, 10)}.pdf`);
        
        toast({
          title: "Export Complete",
          description: "Your analysis has been exported as a PDF.",
        });
      });
    }, 500);
  };

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
          saveAnalysis={saveAnalysis}
        />

        <div id="ats-results-container">
          <ATSResults
            isAnalyzing={isAnalyzing}
            result={result}
            exportAnalysis={exportAnalysis}
            saveAnalysis={async () => {
              if (!result) return;
              setIsSaving(true);
              try {
                await saveAnalysis(result);
                toast({
                  title: "Analysis Saved",
                  description: "Your analysis has been saved successfully.",
                });
              } catch (error) {
                toast({
                  title: "Save Failed",
                  description: "Failed to save analysis. Please try again.",
                  variant: "destructive"
                });
              } finally {
                setIsSaving(false);
              }
            }}
            savedAnalyses={savedAnalyses}
            loadAnalysis={loadAnalysis}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default ATSChecker;
