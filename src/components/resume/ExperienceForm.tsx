
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrent?: boolean;
}

interface ExperienceFormProps {
  data: ExperienceItem[];
  updateData: (data: ExperienceItem[]) => void;
}

const ExperienceForm = ({ data, updateData }: ExperienceFormProps) => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(data || []);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<ExperienceItem>({
    defaultValues: {
      id: "",
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
      isCurrent: false,
    }
  });

  useEffect(() => {
    updateData(experiences);
  }, [experiences, updateData]);

  const addExperience = (formData: ExperienceItem) => {
    if (editIndex >= 0) {
      const updatedExperiences = [...experiences];
      updatedExperiences[editIndex] = { ...formData, id: experiences[editIndex].id };
      setExperiences(updatedExperiences);
      setEditIndex(-1);
    } else {
      setExperiences([
        ...experiences,
        { ...formData, id: `exp-${Date.now()}` }
      ]);
    }
    reset();
  };

  const editExperience = (index: number) => {
    const exp = experiences[index];
    Object.entries(exp).forEach(([key, value]) => {
      setValue(key as keyof ExperienceItem, value);
    });
    setEditIndex(index);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
    if (editIndex === index) {
      reset();
      setEditIndex(-1);
    }
  };

  const generateAIDescription = async () => {
    try {
      const company = watch("company");
      const position = watch("position");
      const currentDescription = watch("description");
      
      if (!company || !position) {
        toast({
          title: "Missing Information",
          description: "Please enter a company name and position to generate a description.",
          variant: "destructive"
        });
        return;
      }

      setIsGenerating(true);
      
      const response = await supabase.functions.invoke('resume-ai-helper', {
        body: {
          section: 'experience',
          currentContent: currentDescription,
          jobTitle: position,
          industry: "Technology", // This would ideally be customizable
          experienceLevel: "mid-level", // This would ideally be customizable
          prompt: {
            company,
            position,
            context: "Focus on quantifiable achievements and key responsibilities"
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.content) {
        setValue("description", response.data.content);
        
        toast({
          title: "Description Generated",
          description: "Your job description has been created with AI assistance.",
        });
      }
    } catch (error) {
      console.error("Error generating job description:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isCurrent = watch("isCurrent");

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(addExperience)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-lg font-bold">Company</Label>
          <Input
            id="company"
            {...register("company")}
            placeholder="Company Name"
            className="border-4 border-black p-6 text-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position" className="text-lg font-bold">Position</Label>
          <Input
            id="position"
            {...register("position")}
            placeholder="Job Title"
            className="border-4 border-black p-6 text-lg"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-lg font-bold">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              className="border-4 border-black p-6 text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-lg font-bold">End Date</Label>
            <Input
              id="endDate"
              type="date"
              {...register("endDate")}
              className="border-4 border-black p-6 text-lg"
              disabled={isCurrent}
              required={!isCurrent}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="isCurrent"
              type="checkbox"
              {...register("isCurrent")}
              className="w-5 h-5 border-2 border-black"
            />
            <Label htmlFor="isCurrent" className="ml-2 text-lg">
              I currently work here
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-lg font-bold">Job Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Describe your responsibilities and achievements..."
            className="border-4 border-black p-6 text-lg min-h-[150px]"
            required
          />
        </div>

        <Button 
          type="button" 
          className="w-full bg-blue-500 text-white border-4 border-black transform hover:rotate-1 transition-transform mb-4"
          onClick={generateAIDescription}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Generating AI Description...
            </>
          ) : (
            "Generate AI Description"
          )}
        </Button>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white border-4 border-black transform hover:-rotate-1 transition-transform"
          >
            {editIndex >= 0 ? "Update Experience" : "Add Experience"}
          </Button>
        </div>
      </form>

      {experiences.length > 0 && (
        <div className="space-y-4 pt-4 border-t-4 border-black">
          <h3 className="text-xl font-bold">Work Experience</h3>
          {experiences.map((exp, index) => (
            <Card key={exp.id} className="border-4 border-black relative">
              <CardHeader className="pb-2">
                <CardTitle>{exp.position} at {exp.company}</CardTitle>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 border-2 border-black"
                  onClick={() => removeExperience(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pb-0">
                <p className="text-gray-600">
                  {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                </p>
                <p className="mt-2">{exp.description}</p>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  variant="outline" 
                  className="border-2 border-black"
                  onClick={() => editExperience(index)}
                >
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {experiences.length === 0 && (
        <div className="border-4 border-black p-6 text-center bg-gray-50">
          <p className="text-lg text-gray-500">No work experience added yet.</p>
          <Button 
            variant="outline" 
            className="mt-2 flex items-center gap-2 border-2 border-black mx-auto"
          >
            <Plus className="h-4 w-4" /> Add Your First Role
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExperienceForm;
