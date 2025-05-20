
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getResumeTemplates, defaultTemplates, type ResumeTemplate } from "@/lib/templates";
import { Loader2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface TemplateSelectorProps {
  onSelect: (template: ResumeTemplate) => void;
  selectedId?: string;
}

const TemplateSelector = ({ onSelect, selectedId }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getResumeTemplates();
        console.log("Templates loaded:", data);
        if (data && data.length > 0) {
          setTemplates(data);
        } else {
          console.log("No templates returned from API, using defaults");
          setTemplates(defaultTemplates);
        }
      } catch (error) {
        console.error("Error loading templates:", error);
        toast({
          title: "Error loading templates",
          description: "Failed to load resume templates. Using default templates instead.",
          variant: "destructive",
        });
        // Use default templates when API fails
        setTemplates(defaultTemplates);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Always use defaultTemplates as a fallback if templates array is empty
  const displayTemplates = templates.length > 0 ? templates : defaultTemplates;

  if (displayTemplates.length === 0) {
    return (
      <div className="border-4 border-black p-6 text-center bg-gray-50 w-full">
        <p className="text-lg text-gray-500">No resume templates found.</p>
        <p className="text-md text-gray-400 mt-2">
          Please try refreshing the page if you continue to have issues.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {displayTemplates.map((template) => (
        <Card 
          key={template.id}
          className={`border-4 ${
            selectedId === template.id 
              ? 'border-pink-500 shadow-[4px_4px_0px_0px_rgba(236,72,153,1)]' 
              : 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          } transition-all hover:-translate-y-1`}
        >
          <CardHeader className="p-4">
            <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
            <CardDescription className="text-sm">{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <AspectRatio ratio={210/297} className="rounded-md overflow-hidden border-2 border-black">
              <img
                src={template.thumbnail_url}
                alt={`${template.name} template preview`}
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              onClick={() => onSelect(template)}
              className={`w-full ${
                selectedId === template.id
                  ? 'bg-pink-500 hover:bg-pink-600'
                  : 'bg-black hover:bg-gray-800'
              } text-white border-2 border-black transform hover:rotate-1 transition-transform`}
            >
              {selectedId === template.id ? 'Selected' : 'Use Template'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default TemplateSelector;
