
import { Card } from "@/components/ui/card";

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
}

const ResumePreview = ({ data }: ResumePreviewProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="text-sm">
      {/* Personal Info */}
      {data.personal.fullName && (
        <div className="mb-6 border-b-2 border-black pb-4">
          <h2 className="text-2xl font-bold">{data.personal.fullName}</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
            {data.personal.email && <span>{data.personal.email}</span>}
            {data.personal.phone && <span>{data.personal.phone}</span>}
            {data.personal.location && <span>{data.personal.location}</span>}
          </div>
          {data.personal.summary && <p className="mt-2">{data.personal.summary}</p>}
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform -rotate-1">Experience</h3>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3 last:mb-0">
              <div className="flex justify-between">
                <h4 className="font-bold">{exp.position}</h4>
                <span className="text-xs font-medium">
                  {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <p className="text-gray-700">{exp.company}</p>
              <p className="mt-1 text-xs">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform rotate-1">Education</h3>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-3 last:mb-0">
              <div className="flex justify-between">
                <h4 className="font-bold">{edu.degree} in {edu.field}</h4>
                <span className="text-xs font-medium">
                  {formatDate(edu.startDate)} - {edu.isCurrent ? "Present" : formatDate(edu.endDate)}
                </span>
              </div>
              <p className="text-gray-700">{edu.institution}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform -rotate-1">Skills</h3>
          <div className="flex flex-wrap gap-1">
            {data.skills.map((skill, index) => (
              <span key={index} className="bg-gray-100 px-2 py-0.5 text-xs border border-black">
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

      {/* Export buttons */}
      <div className="mt-8 space-y-2">
        <button className="w-full bg-pink-500 text-white py-2 border-2 border-black font-medium hover:bg-pink-600 transform hover:-rotate-1 transition-transform">
          Export PDF
        </button>
        <button className="w-full bg-gray-200 text-black py-2 border-2 border-black font-medium hover:bg-gray-300 transform hover:rotate-1 transition-transform">
          Share Link
        </button>
      </div>
    </div>
  );
};

export default ResumePreview;
