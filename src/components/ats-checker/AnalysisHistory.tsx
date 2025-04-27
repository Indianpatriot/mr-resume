
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistance } from "date-fns";
import type { AnalysisResult } from "@/pages/ATSChecker";

interface AnalysisHistoryProps {
  analyses: AnalysisResult[];
  loadAnalysis: (analysis: AnalysisResult) => void;
}

export const AnalysisHistory = ({ analyses, loadAnalysis }: AnalysisHistoryProps) => {
  return (
    <ScrollArea className="h-64 border-4 border-black rounded-md">
      <div className="p-4 space-y-4">
        {analyses.map((analysis, index) => {
          const date = analysis.createdAt ? new Date(analysis.createdAt) : null;
          
          return (
            <div 
              key={index} 
              className="p-3 border-2 border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold">{analysis.score}%</span>
                    <div className={`h-2 w-24 rounded-full ${getScoreColorClass(analysis.score)}`}></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {date ? `${formatDistance(date, new Date())} ago` : 'Recent analysis'}
                  </p>
                  <p className="text-sm mt-1 truncate max-w-[250px]">
                    {analysis.jobTitle || 'Job position analysis'}
                  </p>
                </div>
                <Button 
                  onClick={() => loadAnalysis(analysis)} 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-black hover:bg-gray-100"
                >
                  View
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

// Helper function to get color class based on score
function getScoreColorClass(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}
