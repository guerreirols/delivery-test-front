interface FeedbackProps {
  children: React.ReactNode;
  tone?: "error" | "success";
}

export function Feedback({ children, tone = "error" }: FeedbackProps) {
  return (
    <div
      className={`feedback feedback--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
