
interface OverallFeedbackProps {
  feedback: string;
}
export const OverallFeedback = ({ feedback }: OverallFeedbackProps) => (
  <div className="bg-gray-100 border-4 border-black p-4">
    <h3 className="font-bold mb-1">Overall Feedback:</h3>
    <p>{feedback}</p>
  </div>
);
