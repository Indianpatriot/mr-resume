
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PersonalInfoData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfoData;
  updateData: (data: PersonalInfoData) => void;
}

const PersonalInfoForm = ({ data, updateData }: PersonalInfoFormProps) => {
  const { register, handleSubmit, setValue, watch, getValues } = useForm<PersonalInfoData>({
    defaultValues: data,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { toast } = useToast();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Set initial values
  useEffect(() => {
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        setValue(key as keyof PersonalInfoData, value);
      });
    }
  }, [data, setValue]);

  // Debounced update function
  const debouncedUpdate = (formValues: PersonalInfoData) => {
    // Clear any existing timer
    if (debounceTimer) clearTimeout(debounceTimer);
    
    // Set a new timer
    const timer = setTimeout(() => {
      updateData(formValues);
    }, 500); // 500ms delay
    
    setDebounceTimer(timer);
  };

  // Watch for form changes
  useEffect(() => {
    const subscription = watch((formValues) => {
      debouncedUpdate(formValues as PersonalInfoData);
    });
    
    // Cleanup function
    return () => {
      subscription.unsubscribe();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [watch, updateData]);

  const generateAISummary = async () => {
    try {
      setIsGenerating(true);
      setAiError(null);
      
      // Get job details from form
      const formValues = getValues();
      const fullName = formValues.fullName || "a professional";
      
      // Some default values if fields are empty
      const jobTitle = "Software Engineer"; // This would ideally come from another form field
      const industry = "Technology";
      const experienceLevel = "mid-level";
      
      const response = await supabase.functions.invoke('resume-ai-helper', {
        body: {
          section: 'summary',
          currentContent: formValues.summary,
          jobTitle,
          industry,
          experienceLevel,
          prompt: `The person's name is ${fullName}.`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate summary");
      }

      if (response.data.content) {
        setValue("summary", response.data.content);
        updateData({
          ...getValues(),
          summary: response.data.content,
        });
        
        toast({
          title: "Summary Generated",
          description: "Your professional summary has been created with AI assistance.",
        });
      } else {
        throw new Error("No content returned from AI");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to generate summary. Please try again.";
      
      setAiError(errorMessage);
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-lg font-bold">Full Name</Label>
        <Input
          id="fullName"
          {...register("fullName")}
          placeholder="John Doe"
          className="border-4 border-black p-6 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-lg font-bold">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john.doe@example.com"
          className="border-4 border-black p-6 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-lg font-bold">Phone Number</Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="(123) 456-7890"
          className="border-4 border-black p-6 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-lg font-bold">Location</Label>
        <Input
          id="location"
          {...register("location")}
          placeholder="New York, NY"
          className="border-4 border-black p-6 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary" className="text-lg font-bold">Professional Summary</Label>
        <Textarea
          id="summary"
          {...register("summary")}
          placeholder="Briefly describe your professional background and career goals..."
          className="border-4 border-black p-6 text-lg min-h-[150px]"
        />
      </div>

      {aiError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-red-700">
                {aiError}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Please make sure the Gemini API key is properly configured.
              </p>
            </div>
          </div>
        </div>
      )}

      <Button 
        type="button" 
        className="w-full bg-blue-500 text-white border-4 border-black transform hover:rotate-1 transition-transform"
        onClick={generateAISummary}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Generating AI Summary...
          </>
        ) : (
          "Generate AI Summary"
        )}
      </Button>
    </form>
  );
};

export default PersonalInfoForm;
