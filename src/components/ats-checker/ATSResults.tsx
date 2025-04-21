
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { KeywordMatch } from "./KeywordMatch";
import { FormatIssues } from "./FormatIssues";
import { ContentSuggestions } from "./ContentSuggestions";
import { SectionFeedback } from "./SectionFeedback";
import { OverallFeedback } from "./OverallFeedback";
import type { AnalysisResult } from "../../pages/ATSChecker";

interface ATSResultsProps {
  isAnalyzing: boolean;
  result: AnalysisResult | null;
}

export const ATSResults = ({ isAnalyzing, result }: ATSResultsProps) => {
  return (
    <Card className="border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader className="border-b-4 border-black bg-blue-500">
        <CardTitle className="text-2xl font-bold text-white">
          Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-8 border-black border-t-pink-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Analyzing your resume...</p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block bg-yellow-400 rounded-full border-8 border-black p-6">
                <span className="text-5xl font-bold">{result.score}%</span>
              </div>
              <p className="mt-2 text-lg font-medium">ATS Compatibility Score</p>
            </div>
            <KeywordMatch matched={result.keywordMatch.matched} missing={result.keywordMatch.missing} />
            <FormatIssues issues={result.formatIssues} />
            <ContentSuggestions suggestions={result.contentSuggestions} />
            {result.sectionFeedback && <SectionFeedback feedback={result.sectionFeedback} />}
            <OverallFeedback feedback={result.overallFeedback} />
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white border-4 border-black transform hover:-rotate-1 transition-transform">
                Update Resume
              </Button>
              <Button variant="outline" className="flex-1 border-4 border-black transform hover:rotate-1 transition-transform">
                Save Analysis
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              Paste your resume and a job description, then click "Analyze Resume" to see your ATS compatibility score.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
