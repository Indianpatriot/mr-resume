
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, FileText, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/pages/ATSChecker";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ATSFormProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (state: boolean) => void;
  setResult: (result: any) => void;
  toast: any;
  saveAnalysis: (result: AnalysisResult) => Promise<void>;
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
  saveAnalysis,
}: ATSFormProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

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

      const analysisResult = response.data as AnalysisResult;
      setResult(analysisResult);

      // Save analysis to database automatically
      try {
        await saveAnalysis(analysisResult);
      } catch (saveError) {
        console.error("Error saving analysis:", saveError);
        // We don't want to show an error to the user if saving fails
        // The analysis is still displayed to the user
      }

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

  const handleFileUpload = (file: File) => {
    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        
        // For PDF files, we need to extract text via Edge Function
        if (file.type === 'application/pdf') {
          try {
            const response = await supabase.functions.invoke("ats-analyzer", {
              body: {
                action: "extractText",
                fileContent: text,
                fileType: "pdf"
              }
            });
            
            if (response.error) throw new Error(response.error.message);
            setResumeText(response.data.text || "");
            
            toast({
              title: "Resume Uploaded",
              description: "Your PDF resume has been processed successfully.",
            });
          } catch (error) {
            console.error("Error extracting PDF text:", error);
            toast({
              title: "Error Processing PDF",
              description: "We couldn't extract text from your PDF. Try pasting the content manually.",
              variant: "destructive"
            });
          }
        } else {
          // For text files, docx, etc. just use the raw text
          setResumeText(text);
          toast({
            title: "Resume Uploaded",
            description: "Your resume has been uploaded successfully.",
          });
        }
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          title: "Upload Failed",
          description: "Failed to read the file. Try pasting the content manually.",
          variant: "destructive"
        });
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.onerror = () => {
      setIsProcessingFile(false);
      toast({
        title: "Upload Failed",
        description: "Failed to read the file. Try pasting the content manually.",
        variant: "destructive"
      });
    };

    // For PDFs, we need the raw binary data to extract text
    if (file.type === 'application/pdf') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileUpload(file);
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
            <Label htmlFor="resumeText" className="text-lg font-bold">Resume</Label>
            <div 
              className={cn(
                "border-4 border-black p-6 text-lg min-h-[200px] rounded-md relative",
                isDragging ? "bg-gray-100 border-dashed" : "",
                resumeText ? "bg-white" : "bg-gray-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!resumeText && !isProcessingFile && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none">
                  <FileText className="w-12 h-12 mb-2 text-gray-400" />
                  <p className="text-gray-500 text-center mb-2">Paste your resume text or drop a file here</p>
                  <p className="text-gray-400 text-sm text-center">Supported file types: TXT, DOCX, PDF</p>
                </div>
              )}
              
              {isProcessingFile && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>Processing your document...</p>
                  </div>
                </div>
              )}
              
              <Textarea
                id="resumeText"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder=""
                className="border-none p-0 h-full min-h-[200px] bg-transparent focus-visible:ring-0"
              />
              
              <div className="absolute right-4 bottom-4 flex gap-2">
                <label className="cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".txt,.pdf,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                    onChange={handleFileInputChange}
                    disabled={isProcessingFile}
                  />
                  <div className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm">
                    <Upload className="w-4 h-4" />
                    <span>Upload Resume</span>
                  </div>
                </label>
              </div>
            </div>
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
