
interface KeywordMatchProps {
  matched: string[];
  missing: string[];
}
export const KeywordMatch = ({ matched, missing }: KeywordMatchProps) => (
  <div>
    <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform -rotate-1">
      Keyword Analysis
    </h3>
    <div className="mt-4 space-y-3">
      <div>
        <p className="font-bold">Matched Keywords:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {matched.map((keyword, i) => (
            <span key={i} className="bg-green-100 border-2 border-green-600 px-2 py-0.5 text-green-800">
              {keyword}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="font-bold">Missing Keywords:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {missing.map((keyword, i) => (
            <span key={i} className="bg-red-100 border-2 border-red-600 px-2 py-0.5 text-red-800">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);
