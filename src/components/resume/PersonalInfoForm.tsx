
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";

interface PersonalInfoData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  jobTitle: string;
  industry: string;
  experienceLevel: string;
  linkedIn?: string;
  portfolio?: string;
  careerObjective?: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfoData;
  updateData: (data: PersonalInfoData) => void;
}

const PersonalInfoForm = ({ data, updateData }: PersonalInfoFormProps) => {
  const { register, handleSubmit, setValue, watch, getValues, control } = useForm<PersonalInfoData>({
    defaultValues: {
      fullName: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      summary: data.summary || "",
      jobTitle: data.jobTitle || "",
      industry: data.industry || "Technology",
      experienceLevel: data.experienceLevel || "mid-level",
      linkedIn: data.linkedIn || "",
      portfolio: data.portfolio || "",
      careerObjective: data.careerObjective || "",
    },
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { toast } = useToast();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Set initial values
  useEffect(() => {
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          setValue(key as keyof PersonalInfoData, value);
        }
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
      
      // Get values from form
      const jobTitle = formValues.jobTitle || "Professional";
      const industry = formValues.industry || "Technology";
      const experienceLevel = formValues.experienceLevel || "mid-level";
      const careerObjective = formValues.careerObjective || "";
      
      const response = await supabase.functions.invoke('resume-ai-helper', {
        body: {
          section: 'summary',
          currentContent: formValues.summary,
          context: {
            jobTitle,
            industry,
            experienceLevel,
            careerObjective
          },
          prompt: `The person's name is ${fullName}. Their career objective is: ${careerObjective}.`
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

  const industryOptions = [
    "Technology", "Healthcare", "Finance", "Education", 
    "Retail", "Manufacturing", "Marketing", "Media", 
    "Construction", "Hospitality", "Government", "Non-profit",
    "Transportation", "Entertainment", "Energy", "Agriculture"
  ];

  const experienceLevelOptions = [
    "entry-level", "junior", "mid-level", "senior", "manager", "director", "executive"
  ];

  return (
    <form className="space-y-6">
      <div className="space-y-6">
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
          <Label htmlFor="jobTitle" className="text-lg font-bold">Current or Target Job Title</Label>
          <Input
            id="jobTitle"
            {...register("jobTitle")}
            placeholder="Software Engineer"
            className="border-4 border-black p-6 text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-lg font-bold">Industry</Label>
            <Select
              onValueChange={(value) => setValue("industry", value)}
              defaultValue={getValues("industry") || "Technology"}
            >
              <SelectTrigger id="industry" className="border-4 border-black p-6 text-lg">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((industry) => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceLevel" className="text-lg font-bold">Experience Level</Label>
            <Select
              onValueChange={(value) => setValue("experienceLevel", value)}
              defaultValue={getValues("experienceLevel") || "mid-level"}
            >
              <SelectTrigger id="experienceLevel" className="border-4 border-black p-6 text-lg">
                <SelectValue placeholder="Select Experience Level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevelOptions.map((level) => (
                  <SelectItem key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <Label htmlFor="linkedIn" className="text-lg font-bold">LinkedIn Profile (Optional)</Label>
          <Input
            id="linkedIn"
            {...register("linkedIn")}
            placeholder="linkedin.com/in/username"
            className="border-4 border-black p-6 text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio" className="text-lg font-bold">Portfolio/Website (Optional)</Label>
          <Input
            id="portfolio"
            {...register("portfolio")}
            placeholder="yourwebsite.com"
            className="border-4 border-black p-6 text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="careerObjective" className="text-lg font-bold">Career Objective (Optional)</Label>
          <Textarea
            id="careerObjective"
            {...register("careerObjective")}
            placeholder="Describe your career goals and aspirations..."
            className="border-4 border-black p-6 text-lg min-h-[100px]"
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
      </div>
    </form>
  );
};

export default PersonalInfoForm;
