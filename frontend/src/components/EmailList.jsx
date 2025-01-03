import React, { useState } from "react";
import "./EmailList.css";
import EmailCard from "./EmailCard";
import Pagination from "./Pagination";
import axios from "axios";

const priorityOrder = { High: 1, Medium: 2, Low: 3 }; // Define priority sorting order

const EmailList = ({ emails, markAsRead }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null); // Track selected email for body view
  const [responseText, setResponseText] = useState(""); // Track generated response
  const emailsPerPage = 5;

  const API_BASE_URL =
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8000"
      : "https://smart-email-automation-backend.onrender.com";

  // Sort emails: unread first, then by priority, then read
  const sortedEmails = [...emails].sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead - b.isRead; // Unread emails first
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority]; // Sort by priority
  });

  // Pagination logic
  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = sortedEmails.slice(indexOfFirstEmail, indexOfLastEmail);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleShowBody = (email) => {
    setSelectedEmail(email); // Set the selected email
    setResponseText(""); // Clear any previous response text
  };

  const handleCloseBodyView = () => {
    setSelectedEmail(null); // Clear the selected email
    setResponseText(""); // Clear the response text
  };

  const handleGenerateResponse = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/generate_response`, {
        body: selectedEmail.body, // Send the email body instead of ID
      });
      setResponseText(response.data); // Populate input field with the generated response
    } catch (error) {
      console.error("Failed to generate response:", error);
      alert("Failed to generate response");
    }
  };

  const handleSendResponse = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/send_response`, {
        body: selectedEmail.body, // Send the email body
        responseText: responseText, // Send the response text
      });
      alert("Response sent successfully!");
      handleCloseBodyView(); // Close the modal
    } catch (error) {
      console.error("Failed to send response:", error);
      alert("Failed to send response");
    }
  };

  return (
    <div className="email-list">
      <div className="email-cards">
        {currentEmails.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            markAsRead={markAsRead} // Use the local handler
            onShowBody={handleShowBody} // Pass the show body handler
          />
        ))}
      </div>
      <Pagination
        emailsPerPage={emailsPerPage}
        totalEmails={emails.length}
        paginate={paginate}
        currentPage={currentPage}
      />

      {/* Email Body View in Modal */}
      {selectedEmail && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={handleCloseBodyView}>
              &times;
            </button>
            <h4 className="modal-title">{selectedEmail.subject}</h4>
            <p className="modal-body">{selectedEmail.body}</p>
            <button
              className="generate-response"
              onClick={handleGenerateResponse}
            >
              Generate Response
            </button>
            {responseText && (
              <div className="response-container">
                <textarea
                  className="response-input"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)} // Allow editing the response
                  rows="4"
                  placeholder="Generated response will appear here"
                />
                <button
                  className="send-response"
                  onClick={handleSendResponse}
                >
                  Send Response
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailList;
