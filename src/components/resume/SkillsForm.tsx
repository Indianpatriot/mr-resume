
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SkillsFormProps {
  data: string[];
  updateData: (data: string[]) => void;
}

const SkillsForm = ({ data, updateData }: SkillsFormProps) => {
  const [skills, setSkills] = useState<string[]>(data || []);
  const [newSkill, setNewSkill] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Debounced update function
  const debouncedUpdate = useCallback((updatedSkills: string[]) => {
    // Clear any existing timer
    if (debounceTimer) clearTimeout(debounceTimer);
    
    // Set a new timer
    const timer = setTimeout(() => {
      updateData(updatedSkills);
    }, 500); // 500ms delay
    
    setDebounceTimer(timer);
  }, [debounceTimer, updateData]);

  // When local skills state changes, debounce the update to parent
  useEffect(() => {
    debouncedUpdate(skills);
    
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [skills, debouncedUpdate]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const generateAISkills = async () => {
    try {
      setIsGenerating(true);
      setAiError(null);
      
      // These would ideally come from form fields or user selection
      const jobTitle = "Software Engineer";
      const industry = "Technology";
      const experienceLevel = "mid-level";
      
      const response = await supabase.functions.invoke('resume-ai-helper', {
        body: {
          section: 'skills',
          currentContent: skills,
          jobTitle,
          industry,
          experienceLevel
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate skills");
      }

      if (response.data.skills && Array.isArray(response.data.skills)) {
        // Filter out skills that are already in the list
        const newSkills = response.data.skills.filter(
          (skill: string) => !skills.includes(skill)
        );
        
        if (newSkills.length > 0) {
          setSkills(prev => [...prev, ...newSkills]);
          
          toast({
            title: "Skills Generated",
            description: `Added ${newSkills.length} new skills to your profile.`,
          });
        } else {
          toast({
            title: "No New Skills",
            description: "All suggested skills are already in your list.",
          });
        }
      } else {
        throw new Error("No skills returned from AI");
      }
    } catch (error) {
      console.error("Error generating skills:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to generate skills. Please try again.";
      
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
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="newSkill" className="text-lg font-bold">Add Skills</Label>
          <div className="flex">
            <Input
              id="newSkill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="e.g. JavaScript"
              className="border-4 border-black p-6 text-lg"
            />
            <Button
              type="button"
              onClick={addSkill}
              className="ml-2 bg-pink-500 hover:bg-pink-600 text-white border-4 border-black transform hover:-rotate-1 transition-transform"
            >
              Add
            </Button>
          </div>
        </div>

        <Button 
          type="button" 
          className="w-full bg-blue-500 text-white border-4 border-black transform hover:rotate-1 transition-transform"
          onClick={generateAISkills}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Generating AI Skill Suggestions...
            </>
          ) : (
            "Generate AI Skill Suggestions"
          )}
        </Button>

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

        <div className="mt-8">
          <Label className="text-lg font-bold">Your Skills</Label>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-4">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 border-4 border-black px-3 py-2 rounded-md group"
                >
                  <span className="mr-2">{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-4 border-black p-6 text-center bg-gray-50 mt-4">
              <p className="text-lg text-gray-500">No skills added yet. Add skills or use our AI suggestion tool.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsForm;
