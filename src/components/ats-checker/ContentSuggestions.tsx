
interface ContentSuggestionsProps {
  suggestions: string[];
}
export const ContentSuggestions = ({ suggestions }: ContentSuggestionsProps) => (
  <div>
    <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform -rotate-1">
      Improvement Suggestions
    </h3>
    <ul className="list-disc pl-5 space-y-1">
      {suggestions.map((suggestion, i) => (
        <li key={i}>{suggestion}</li>
      ))}
    </ul>
  </div>
);
