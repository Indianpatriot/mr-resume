
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface SkillsFormProps {
  data: string[];
  updateData: (data: string[]) => void;
}

const SkillsForm = ({ data, updateData }: SkillsFormProps) => {
  const [skills, setSkills] = useState<string[]>(data || []);
  const [newSkill, setNewSkill] = useState<string>("");

  useEffect(() => {
    updateData(skills);
  }, [skills, updateData]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    setSkills(updatedSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const generateAISkills = () => {
    // This would connect to an AI endpoint to suggest skills
    const suggestionsByCategory = {
      technical: ["React", "TypeScript", "JavaScript", "Node.js", "REST APIs", "CSS", "HTML", "Git"],
      soft: ["Communication", "Problem Solving", "Teamwork", "Adaptability", "Creativity"],
      tools: ["VS Code", "GitHub", "Docker", "Figma", "Jira", "Slack"]
    };

    const allSuggestions = [
      ...suggestionsByCategory.technical,
      ...suggestionsByCategory.soft,
      ...suggestionsByCategory.tools
    ];

    // Filter out skills that are already added
    const newSuggestions = allSuggestions.filter(skill => !skills.includes(skill));
    
    // Add random skills (up to 8 if available)
    const shuffled = newSuggestions.sort(() => 0.5 - Math.random());
    const selectedSuggestions = shuffled.slice(0, 8);
    
    setSkills([...skills, ...selectedSuggestions]);
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
        >
          Generate AI Skill Suggestions
        </Button>

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
