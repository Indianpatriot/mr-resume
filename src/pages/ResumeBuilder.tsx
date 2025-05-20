
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PersonalInfoForm from "@/components/resume/PersonalInfoForm";
import ExperienceForm from "@/components/resume/ExperienceForm";
import EducationForm from "@/components/resume/EducationForm";
import SkillsForm from "@/components/resume/SkillsForm";
import ResumePreview from "@/components/resume/ResumePreview";
import TemplateSelector from "@/components/resume/TemplateSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Save, Download } from "lucide-react";
import { getCurrentUserId, getAccessToken } from "@/lib/supabase-auth";
import type { ResumeTemplate } from "@/lib/templates";

type ResumeSection = "template" | "personal" | "experience" | "education" | "skills";

const ResumeBuilder = () => {
  const [currentSection, setCurrentSection] = useState<ResumeSection>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("My Resume");
  const [userId, setUserId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const { toast } = useToast();
  
  const [resumeData, setResumeData] = useState({
    personal: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      jobTitle: "",
      industry: "Technology",
      experienceLevel: "mid-level",
      linkedIn: "",
      portfolio: "",
      careerObjective: "",
    },
    experience: [] as any[],
    education: [] as any[],
    skills: [] as string[],
  });

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    };
    
    fetchUserId();
  }, []);
  
  const updateResumeData = (section: Exclude<ResumeSection, "template">, data: any) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const handleTemplateSelect = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    setCurrentSection("personal");
    
    toast({
      title: "Template Selected",
      description: `You've selected the ${template.name} template. Let's start building your resume!`,
    });
  };

  const handleNext = () => {
    switch (currentSection) {
      case "template":
        if (!selectedTemplate) {
          toast({
            title: "Select a Template",
            description: "Please select a template to continue.",
            variant: "destructive"
          });
          return;
        }
        setCurrentSection("personal");
        break;
      case "personal":
        setCurrentSection("experience");
        break;
      case "experience":
        setCurrentSection("education");
        break;
      case "education":
        setCurrentSection("skills");
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentSection) {
      case "personal":
        setCurrentSection("template");
        break;
      case "experience":
        setCurrentSection("personal");
        break;
      case "education":
        setCurrentSection("experience");
        break;
      case "skills":
        setCurrentSection("education");
        break;
      default:
        break;
    }
  };

  const handleSaveResume = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a template before saving your resume.",
        variant: "destructive",
      });
      return;
    }

    if (!resumeData.personal.fullName) {
      toast({
        title: "Missing Information",
        description: "Please enter at least your name before saving the resume.",
        variant: "destructive",
      });
      setCurrentSection("personal");
      return;
    }

    setIsSaving(true);

    try {
      const accessToken = await getAccessToken();
      const currentUserId = await getCurrentUserId();
      
      const response = await fetch("https://wwgejtonllfivubtngfo.supabase.co/functions/v1/resume-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          resumeData,
          templateId: selectedTemplate.id,
          title: resumeData.personal.fullName ? `${resumeData.personal.fullName}'s Resume` : resumeTitle,
          userId: currentUserId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Resume Saved",
          description: "Your resume has been saved successfully! You can access it from your profile.",
        });
        
        // Store the resume data in localStorage as a backup
        localStorage.setItem('savedResumeData', JSON.stringify({
          resumeData,
          templateId: selectedTemplate.id,
          savedAt: new Date().toISOString()
        }));
      } else {
        throw new Error(data.error || "Failed to save resume");
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save resume. Please try again.",
        variant: "destructive",
      });
      
      // Store in localStorage as fallback
      try {
        localStorage.setItem('savedResumeData', JSON.stringify({
          resumeData,
          templateId: selectedTemplate?.id,
          savedAt: new Date().toISOString(),
          savedOffline: true
        }));
        
        toast({
          title: "Offline Backup Created",
          description: "We saved a local backup of your resume due to the server error.",
        });
      } catch (localError) {
        console.error("Error saving local backup:", localError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Try to load saved data from localStorage on first render
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('savedResumeData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setResumeData(parsed.resumeData);
        
        // If there's a templateId, try to set it
        if (parsed.templateId) {
          // The actual template will be loaded by the TemplateSelector component
          console.log("Found saved template ID:", parsed.templateId);
        }
        
        toast({
          title: "Resume Data Loaded",
          description: "Your previously saved resume data has been loaded.",
        });
      }
    } catch (error) {
      console.error("Error loading saved resume data:", error);
    }
  }, []);

  const generateDownloadableResume = () => {
    // This would be implemented to allow users to download their resume as PDF
    toast({
      title: "Coming Soon",
      description: "Resume download feature will be available soon.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 bg-black text-white inline-block px-4 py-2 transform -rotate-1">
        Resume Builder
      </h1>

      <div className="flex flex-col gap-6 w-full">
        <div className="w-full">
          <div className="flex flex-wrap justify-between mb-4 gap-2">
            <Button 
              onClick={() => setShowPreview(!showPreview)}
              className="bg-blue-500 hover:bg-blue-600 text-white border-4 border-black transform hover:rotate-1 transition-transform flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>

            <Button
              onClick={generateDownloadableResume}
              className="bg-green-500 hover:bg-green-600 text-white border-4 border-black transform hover:rotate-1 transition-transform flex items-center gap-2"
              disabled={!selectedTemplate}
            >
              <Download className="h-4 w-4" /> Download Resume
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Main editing area - takes full width on mobile, 8/12 on large screens */}
            <div className={`${showPreview ? 'xl:col-span-8' : 'xl:col-span-12'}`}>
              <Tabs value={currentSection} onValueChange={(value) => setCurrentSection(value as ResumeSection)} className="w-full">
                <Card className="border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader className="border-b-4 border-black bg-yellow-400">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <CardTitle className="text-2xl font-bold">
                        Build Your Resume
                      </CardTitle>
                      <TabsList className="bg-black p-1 overflow-x-auto max-w-full flex flex-wrap justify-center">
                        <TabsTrigger value="template" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white whitespace-nowrap">
                          Template
                        </TabsTrigger>
                        <TabsTrigger value="personal" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white whitespace-nowrap">
                          Personal
                        </TabsTrigger>
                        <TabsTrigger value="experience" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white whitespace-nowrap">
                          Experience
                        </TabsTrigger>
                        <TabsTrigger value="education" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white whitespace-nowrap">
                          Education
                        </TabsTrigger>
                        <TabsTrigger value="skills" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white whitespace-nowrap">
                          Skills
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 overflow-auto">
                    <TabsContent value="template" className="w-full">
                      <TemplateSelector 
                        onSelect={handleTemplateSelect}
                        selectedId={selectedTemplate?.id}
                      />
                    </TabsContent>

                    <TabsContent value="personal">
                      <PersonalInfoForm 
                        data={resumeData.personal}
                        updateData={(data) => updateResumeData("personal", data)}
                      />
                    </TabsContent>

                    <TabsContent value="experience">
                      <ExperienceForm
                        data={resumeData.experience}
                        updateData={(data) => updateResumeData("experience", data)}
                      />
                    </TabsContent>

                    <TabsContent value="education">
                      <EducationForm
                        data={resumeData.education}
                        updateData={(data) => updateResumeData("education", data)}
                      />
                    </TabsContent>

                    <TabsContent value="skills">
                      <SkillsForm
                        data={resumeData.skills}
                        updateData={(data) => updateResumeData("skills", data)}
                      />
                    </TabsContent>

                    <div className="mt-6 flex justify-between">
                      {currentSection !== "template" && (
                        <Button
                          onClick={handleBack}
                          className="bg-white text-black border-4 border-black transform hover:rotate-1 transition-transform"
                        >
                          Back
                        </Button>
                      )}

                      {currentSection !== "skills" ? (
                        <Button
                          onClick={handleNext}
                          className="bg-pink-500 hover:bg-pink-600 text-white border-4 border-black transform hover:-rotate-1 transition-transform ml-auto"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSaveResume}
                          disabled={isSaving}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black border-4 border-black transform hover:-rotate-1 transition-transform ml-auto flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" /> 
                          {isSaving ? "Saving..." : "Save Resume"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Tabs>
            </div>

            {/* Preview panel - only show when preview is enabled */}
            {showPreview && (
              <div className="xl:col-span-4 sticky top-4 self-start">
                <Card className="border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader className="border-b-4 border-black bg-blue-500">
                    <CardTitle className="text-2xl font-bold text-white">
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 overflow-auto max-h-[calc(100vh-200px)]">
                    {selectedTemplate ? (
                      <ResumePreview 
                        data={resumeData}
                        template={selectedTemplate}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-gray-500">Select a template to preview your resume</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
