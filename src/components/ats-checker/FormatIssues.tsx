
interface FormatIssuesProps {
  issues: string[];
}
export const FormatIssues = ({ issues }: FormatIssuesProps) => (
  <div>
    <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform rotate-1">
      Format Issues
    </h3>
    <ul className="list-disc pl-5 space-y-1">
      {issues.map((issue, i) => (
        <li key={i} className="text-red-600">{issue}</li>
      ))}
    </ul>
  </div>
);
