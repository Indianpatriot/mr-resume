
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PersonalInfoForm from "@/components/resume/PersonalInfoForm";
import ExperienceForm from "@/components/resume/ExperienceForm";
import EducationForm from "@/components/resume/EducationForm";
import SkillsForm from "@/components/resume/SkillsForm";
import ResumePreview from "@/components/resume/ResumePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ResumeSection = "personal" | "experience" | "education" | "skills";

const ResumeBuilder = () => {
  const [currentSection, setCurrentSection] = useState<ResumeSection>("personal");
  const [resumeData, setResumeData] = useState({
    personal: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    experience: [] as any[],
    education: [] as any[],
    skills: [] as string[],
  });
  
  const updateResumeData = (section: ResumeSection, data: any) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const handleNext = () => {
    switch (currentSection) {
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

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-8 bg-black text-white inline-block px-4 py-2 transform -rotate-1">
        Resume Builder
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs value={currentSection} onValueChange={(value) => setCurrentSection(value as ResumeSection)} className="w-full">
            <Card className="border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="border-b-4 border-black bg-yellow-400">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold">
                    Build Your Resume
                  </CardTitle>
                  <TabsList className="bg-black p-1">
                    <TabsTrigger value="personal" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="experience" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                      Experience
                    </TabsTrigger>
                    <TabsTrigger value="education" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                      Education
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                      Skills
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
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
                  {currentSection !== "personal" && (
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
                      className="bg-yellow-400 hover:bg-yellow-500 text-black border-4 border-black transform hover:-rotate-1 transition-transform ml-auto"
                    >
                      Save & Generate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-4 border-black bg-blue-500">
              <CardTitle className="text-2xl font-bold text-white">
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResumePreview data={resumeData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
