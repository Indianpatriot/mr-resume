import { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ResumeTemplate } from "@/lib/templates";

interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    isCurrent?: boolean;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
  }>;
  skills: string[];
}

interface ResumePreviewProps {
  data: ResumeData;
  template?: ResumeTemplate;
}

const ResumePreview = ({ data, template }: ResumePreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const exportPDF = async () => {
    if (!resumeRef.current) return;
    
    if (!data.personal.fullName) {
      toast({
        title: "Export Failed",
        description: "Please add some content to your resume before exporting.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Exporting Resume",
      description: "Preparing your resume for download...",
    });

    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2, // Higher quality
        useCORS: true, // Enable loading external images
        logging: false, // Disable logging
        backgroundColor: '#ffffff' // Ensure white background
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, width, height, undefined, 'FAST');
      
      // Apply template-specific styling if available
      if (template?.content?.style) {
        const { colors } = template.content.style;
        // Add any template-specific PDF styling here
      }

      pdf.save(`${data.personal.fullName.replace(/\s+/g, '-')}-Resume.pdf`);
      
      toast({
        title: "Export Complete",
        description: "Your resume has been exported as a PDF.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export your resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  const shareResume = () => {
    // This will be implemented with the resume sharing service
    toast({
      title: "Feature Coming Soon",
      description: "Resume sharing will be available in the next update.",
    });
  };

  const getTemplateStyles = () => {
    if (!template) return {};

    const { style } = template.content;
    return {
      '--primary-color': style.colors.primary,
      '--secondary-color': style.colors.secondary,
      '--accent-color': style.colors.accent,
      '--heading-font': style.typography.headingFont,
      '--body-font': style.typography.bodyFont,
      '--section-gap': style.spacing.sectionGap,
      '--element-gap': style.spacing.elementGap,
    } as React.CSSProperties;
  };

  return (
    <div className="text-sm">
      <div 
        ref={resumeRef}
        style={getTemplateStyles()}
        className="bg-white p-8 shadow-lg min-h-[297mm] w-[210mm] mx-auto"
      >
        {/* Personal Info */}
        {data.personal.fullName && (
          <div className="mb-6 border-b-2 border-[var(--primary-color,#000)] pb-4">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--heading-font, serif)' }}>
              {data.personal.fullName}
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[var(--secondary-color,#666)]">
              {data.personal.email && <span>{data.personal.email}</span>}
              {data.personal.phone && <span>{data.personal.phone}</span>}
              {data.personal.location && <span>{data.personal.location}</span>}
            </div>
            {data.personal.summary && (
              <p className="mt-2" style={{ fontFamily: 'var(--body-font, sans-serif)' }}>
                {data.personal.summary}
              </p>
            )}
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 bg-[var(--accent-color,#000)] text-white inline-block px-2 transform -rotate-1">
              Experience
            </h3>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-3 last:mb-0">
                <div className="flex justify-between">
                  <h4 className="font-bold">{exp.position}</h4>
                  <span className="text-xs font-medium">
                    {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <p className="text-[var(--secondary-color,#666)]">{exp.company}</p>
                <p className="mt-1 text-xs">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 bg-[var(--accent-color,#000)] text-white inline-block px-2 transform rotate-1">
              Education
            </h3>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-3 last:mb-0">
                <div className="flex justify-between">
                  <h4 className="font-bold">{edu.degree} in {edu.field}</h4>
                  <span className="text-xs font-medium">
                    {formatDate(edu.startDate)} - {edu.isCurrent ? "Present" : formatDate(edu.endDate)}
                  </span>
                </div>
                <p className="text-[var(--secondary-color,#666)]">{edu.institution}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2 bg-[var(--accent-color,#000)] text-white inline-block px-2 transform -rotate-1">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-[var(--primary-color,#000)] bg-opacity-10 px-2 py-0.5 text-xs border border-[var(--primary-color,#000)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!data.personal.fullName && data.experience.length === 0 && data.education.length === 0 && data.skills.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">Complete the forms to preview your resume</p>
          </div>
        )}
      </div>

      {/* Export buttons */}
      <div className="mt-8 space-y-2">
        <Button
          onClick={exportPDF}
          className="w-full bg-pink-500 text-white py-2 border-2 border-black font-medium hover:bg-pink-600 transform hover:-rotate-1 transition-transform flex justify-center items-center"
        >
          <Download className="mr-2 h-4 w-4" /> Export PDF
        </Button>
        <Button
          onClick={shareResume}
          className="w-full bg-gray-200 text-black py-2 border-2 border-black font-medium hover:bg-gray-300 transform hover:rotate-1 transition-transform flex justify-center items-center"
        >
          <Share2 className="mr-2 h-4 w-4" /> Share Link
        </Button>
      </div>
    </div>
  );
};

export default ResumePreview;