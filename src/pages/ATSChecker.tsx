import { useState, useEffect } from "react";
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
  // Add the content field to fix the TypeScript error
  content?: {
    type?: string;
    result?: any;
    job_description?: string;
    resume_text?: string;
  };
}

const ATSChecker = () => {
  const [resumeText, setResumeText] = useState(() => {
    // Try to load from localStorage on component mount
    const savedResume = localStorage.getItem("ats_resume_text");
    return savedResume || "";
  });
  
  const [jobDescription, setJobDescription] = useState(() => {
    // Try to load from localStorage on component mount
    const savedJobDesc = localStorage.getItem("ats_job_description");
    return savedJobDesc || "";
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<AnalysisResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Save resume text and job description to localStorage when they change
  useEffect(() => {
    if (resumeText) {
      localStorage.setItem("ats_resume_text", resumeText);
    }
  }, [resumeText]);

  useEffect(() => {
    if (jobDescription) {
      localStorage.setItem("ats_job_description", jobDescription);
    }
  }, [jobDescription]);

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  // Fetch saved analyses when component mounts or user changes
  useEffect(() => {
    fetchSavedAnalyses();
  }, [userId]);

  // Function to save analysis to database
  const saveAnalysis = async (analysisResult: AnalysisResult): Promise<void> => {
    try {
      // Extract job title from the job description (first line or first sentence)
      const jobTitleMatch = jobDescription.match(/^(.+?)(?:\n|$)/);
      const jobTitle = jobTitleMatch ? jobTitleMatch[1].trim() : "Untitled Position";

      // Get current user or use anonymous ID
      const currentUserId = userId || 'anonymous-user';

      // Save to database - using the resumes table with content field for storing analysis
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          title: jobTitle,
          user_id: currentUserId, // Use actual user ID or anonymous marker
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
            job_description: jobDescription,
            resume_text: resumeText
          },
          ats_score: analysisResult.score
        })
        .select();

      if (error) {
        console.error("Error saving analysis:", error);
        
        // If we failed to save to the database, save to localStorage as fallback
        try {
          const localSaves = JSON.parse(localStorage.getItem("ats_saved_analyses") || "[]");
          const localSaveItem = {
            ...analysisResult,
            id: `local-${Date.now()}`,
            createdAt: new Date().toISOString(),
            jobTitle: jobTitle,
            localOnly: true
          };
          
          localSaves.unshift(localSaveItem);
          localStorage.setItem("ats_saved_analyses", JSON.stringify(localSaves.slice(0, 10))); // Keep only the 10 most recent
          
          // Add to local state
          setSavedAnalyses(prev => [localSaveItem, ...prev.filter(a => a.id !== localSaveItem.id)]);
          
          toast({
            title: "Analysis Saved Locally",
            description: "Your analysis was saved to your browser. Create an account to save online.",
          });
        } catch (localError) {
          console.error("Error saving analysis locally:", localError);
          throw new Error("Failed to save analysis");
        }
        return;
      }

      // Add to local state
      if (data && data[0]) {
        const savedAnalysis = {
          ...analysisResult,
          id: data[0].id,
          createdAt: data[0].created_at,
          jobTitle: jobTitle
        };

        setSavedAnalyses(prev => [savedAnalysis, ...prev.filter(a => a.id !== savedAnalysis.id)]);
        
        toast({
          title: "Analysis Saved",
          description: "Your analysis has been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error in saveAnalysis:", error);
      throw error;
    }
  };

  // Function to fetch saved analyses from database and localStorage
  const fetchSavedAnalyses = async () => {
    const analyses: AnalysisResult[] = [];
    
    try {
      // Check local storage first
      const localSaves = JSON.parse(localStorage.getItem("ats_saved_analyses") || "[]");
      analyses.push(...localSaves);
      
      // Then get from database if user is logged in
      if (userId) {
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq('content->>type', 'ats_analysis')
          .eq('user_id', userId)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // Transform data to match our AnalysisResult interface
        const dbAnalyses = data.map(item => {
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
        
        // Combine db analyses with local ones, removing duplicates
        const dbIds = new Set(dbAnalyses.map(item => item.id));
        const uniqueLocalAnalyses = analyses.filter(item => !dbIds.has(item.id));
        
        analyses.length = 0; // Clear array
        analyses.push(...dbAnalyses, ...uniqueLocalAnalyses);
      }

      setSavedAnalyses(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    }
  };

  // Function to load a saved analysis
  const loadAnalysis = (analysis: AnalysisResult) => {
    setResult(analysis);
    
    // If the analysis has the original resume and job description, load those too
    const savedContent = savedAnalyses.find(a => a.id === analysis.id)?.content;
    if (savedContent) {
      if (savedContent.resume_text) {
        setResumeText(savedContent.resume_text);
      }
      if (savedContent.job_description) {
        setJobDescription(savedContent.job_description);
      }
    }
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
