
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ATSFormProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (state: boolean) => void;
  setResult: (result: any) => void;
  toast: any;
}

export const ATSForm = ({
  resumeText,
  setResumeText,
  jobDescription,
  setJobDescription,
  isAnalyzing,
  setIsAnalyzing,
  setResult,
  toast,
}: ATSFormProps) => {
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
      const response = await supabase.functions.invoke("ats-analyzer", {
        body: {
          resumeText,
          jobDescription
        }
      });

      if (response.error) throw new Error(response.error.message);

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
  );
};
