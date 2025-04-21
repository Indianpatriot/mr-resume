
interface SectionFeedbackProps {
  feedback: {
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
  };
}
export const SectionFeedback = ({ feedback }: SectionFeedbackProps) => (
  <div>
    <h3 className="text-lg font-bold mb-2 bg-black text-white inline-block px-2 transform rotate-1">
      Section Feedback
    </h3>
    <div className="space-y-2 mt-2">
      {feedback.summary && (
        <div>
          <p className="font-bold">Summary:</p>
          <p className="text-sm">{feedback.summary}</p>
        </div>
      )}
      {feedback.experience && (
        <div>
          <p className="font-bold">Experience:</p>
          <p className="text-sm">{feedback.experience}</p>
        </div>
      )}
      {feedback.education && (
        <div>
          <p className="font-bold">Education:</p>
          <p className="text-sm">{feedback.education}</p>
        </div>
      )}
      {feedback.skills && (
        <div>
          <p className="font-bold">Skills:</p>
          <p className="text-sm">{feedback.skills}</p>
        </div>
      )}
    </div>
  </div>
);
