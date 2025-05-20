
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, FileText, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "@/pages/ATSChecker";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

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
  const [processingProgress, setProcessingProgress] = useState(0);
  const [fileProcessingError, setFileProcessingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progress simulation for better UX during file processing
  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>;
    if (isProcessingFile) {
      setProcessingProgress(0);
      progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          const increment = Math.random() * 15;
          const newProgress = prev + increment;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 500);
    } else {
      setProcessingProgress(0);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isProcessingFile]);

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
    setFileProcessingError(null);

    try {
      const response = await supabase.functions.invoke("ats-analyzer", {
        body: {
          resumeText,
          jobDescription
        }
      });

      if (response.error) throw new Error(response.error.message || "Analysis failed");

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

  const handleFileUpload = async (file: File) => {
    setIsProcessingFile(true);
    setFileProcessingError(null);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 10MB.",
        variant: "destructive"
      });
      setIsProcessingFile(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        let fileType = file.type;
        
        // Map from mime types to simpler types
        const fileTypeMap: Record<string, string> = {
          'application/pdf': 'pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
          'application/msword': 'doc',
          'text/plain': 'txt',
        };
        
        const simpleFileType = fileTypeMap[fileType] || 'unknown';
        
        if (simpleFileType === 'unknown') {
          // Try to detect file type from extension
          const extension = file.name.split('.').pop()?.toLowerCase() || '';
          if (['pdf', 'docx', 'doc', 'txt'].includes(extension)) {
            fileType = extension;
          }
        }
        
        try {
          const response = await supabase.functions.invoke("ats-analyzer", {
            body: {
              action: "extractText",
              fileContent: content,
              fileType: simpleFileType,
              fileName: file.name
            }
          });
          
          if (response.error || !response.data.success) {
            throw new Error(response.error?.message || "Failed to process document");
          }
          
          setResumeText(response.data.text || "");
          
          toast({
            title: "Resume Uploaded",
            description: `Your ${file.name} has been processed successfully.`,
          });
        } catch (error) {
          console.error("Error extracting document text:", error);
          setFileProcessingError(`Error processing document. Try a different format or paste the content manually.`);
          toast({
            title: "Error Processing Document",
            description: "We couldn't extract text from your document. Try a different format or paste the content manually.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error reading file:", error);
        setFileProcessingError("Failed to read the file. Try a different format or paste the content manually.");
        toast({
          title: "Upload Failed",
          description: "Failed to read the file. Try a different format or paste the content manually.",
          variant: "destructive"
        });
      } finally {
        setIsProcessingFile(false);
        setProcessingProgress(100);
        setTimeout(() => setProcessingProgress(0), 500); // Reset progress after a delay
      }
    };

    reader.onerror = () => {
      setIsProcessingFile(false);
      setFileProcessingError("Failed to read the file.");
      toast({
        title: "Upload Failed",
        description: "Failed to read the file. Try a different format or paste the content manually.",
        variant: "destructive"
      });
    };

    // For all document types, we send as data URL for consistent handling
    reader.readAsDataURL(file);
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
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
                  <p className="text-gray-400 text-sm text-center">Supported file types: TXT, PDF, DOCX, DOC</p>
                </div>
              )}
              
              {isProcessingFile && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10">
                  <div className="flex flex-col items-center w-3/4 max-w-md">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="mb-2">Processing your document...</p>
                    <Progress value={processingProgress} className="h-2 w-full mb-1" />
                    <p className="text-xs text-gray-500">
                      {processingProgress < 100 ? "Extracting text content..." : "Completed"}
                    </p>
                  </div>
                </div>
              )}
              
              {fileProcessingError && !isProcessingFile && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Processing Error</AlertTitle>
                  <AlertDescription>
                    {fileProcessingError}
                  </AlertDescription>
                </Alert>
              )}
              
              <Textarea
                id="resumeText"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder=""
                className="border-none p-0 h-full min-h-[200px] bg-transparent focus-visible:ring-0"
              />
              
              <div className="absolute right-4 bottom-4 flex gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-gray-300"
                  onClick={triggerFileInput}
                  disabled={isProcessingFile}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Resume</span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".txt,.pdf,.docx,.doc,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword" 
                    onChange={handleFileInputChange}
                    disabled={isProcessingFile}
                  />
                </Button>
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
            disabled={isAnalyzing || isProcessingFile}
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
