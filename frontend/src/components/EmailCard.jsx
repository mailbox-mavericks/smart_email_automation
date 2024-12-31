import React from "react";
import "./EmailCard.css";

const EmailCard = ({ email, onShowBody, markAsRead }) => {
  // Function to get the color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ff7043"; // Orange for High
      case "Medium":
        return "#ffeb3b"; // Yellow for Medium
      case "Low":
        return "#66bb6a"; // Green for Low
      default:
        return "#888"; // Default gray color
    }
  };

  // Function to get the color based on sentiment
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return "#66bb6a"; // Green for Positive
      case "Negative":
        return "#ff7043"; // Orange for Negative
      case "Neutral":
        return "#ffd54f"; // Yellow for Neutral
      default:
        return "#888"; // Default gray color
    }
  };

  return (
    <div className={`email-card ${email.isRead ? "read" : "unread"}`}>
      <div className="email-header">
        <h3
          className="email-subject"
          onClick={() => onShowBody(email)}
          style={{ cursor: "pointer" }}
        >
          {email.subject}
        </h3>
        <div className="email-meta">
          <button
            className="btn-priority"
            style={{
              backgroundColor: getPriorityColor(email.priority),
              color: "black",
            }}
          >
            Priority: {email.priority}
          </button>
          <button
            className="btn-sentiment"
            style={{
              backgroundColor: getSentimentColor(email.sentiment),
              color: "black",
            }}
          >
            Sentiment: {email.sentiment}
          </button>
        </div>
      </div>

      {!email.isRead && (
        <button className="btn-mark-read" onClick={() => markAsRead(email.id)}>
          Mark as Read
        </button>
      )}
    </div>
  );
};

export default EmailCard;
