
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="bg-black text-white p-8 border-b-8 border-pink-500">
          <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-center transform -rotate-1">
              <span className="bg-pink-500 px-4 py-2 inline-block mb-4">AI-POWERED</span>
              <br />
              <span className="bg-yellow-400 px-4 py-2 text-black inline-block rotate-1">
                RESUME BUILDER
              </span>
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl text-center mb-10 border-4 border-white p-4 transform rotate-1 bg-black">
              Create stunning resumes & pass ATS checks with AI assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                asChild 
                size="lg" 
                className="bg-yellow-400 text-black hover:bg-yellow-500 border-4 border-black px-8 py-6 text-xl font-bold transform -rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <Link to="/builder">CREATE RESUME</Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                className="bg-pink-500 text-white hover:bg-pink-600 border-4 border-black px-8 py-6 text-xl font-bold transform rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <Link to="/ats-checker">ATS CHECKER</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-8 border-8 border-black transform -rotate-1 hover:rotate-0 transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-bold mb-4 bg-yellow-400 inline-block p-2">AI Resume Builder</h3>
            <p className="text-lg">Create professional resumes with AI assistance. Get suggestions for content and formatting.</p>
          </div>
          <div className="bg-white p-8 border-8 border-black transform rotate-1 hover:rotate-0 transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-bold mb-4 bg-pink-500 text-white inline-block p-2">ATS Optimization</h3>
            <p className="text-lg">Ensure your resume passes through Applicant Tracking Systems with our AI-powered checker.</p>
          </div>
          <div className="bg-white p-8 border-8 border-black transform -rotate-1 hover:rotate-0 transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-bold mb-4 bg-blue-500 text-white inline-block p-2">Multiple Templates</h3>
            <p className="text-lg">Choose from various neo-brutalist resume templates that stand out from the crowd.</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-yellow-400 p-8 border-t-8 border-black">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h2 className="text-4xl font-bold mb-6 text-center transform -rotate-1 bg-black text-white inline-block p-4">
            Ready to build your standout resume?
          </h2>
          <Button 
            asChild 
            size="lg" 
            className="bg-black text-white hover:bg-gray-800 border-4 border-white px-8 py-6 text-xl font-bold transform rotate-1 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)]"
          >
            <Link to="/auth">GET STARTED</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
