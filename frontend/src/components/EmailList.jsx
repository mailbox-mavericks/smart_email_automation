import React, { useState } from "react";
import "./EmailList.css";
import EmailCard from "./EmailCard";
import Pagination from "./Pagination";

const priorityOrder = { High: 1, Medium: 2, Low: 3 }; // Define priority sorting order

const EmailList = ({ emails, markAsRead }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null); // Track selected email for body view
  const emailsPerPage = 5;

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

  const handleMarkAsRead = (id) => {
    markAsRead(id); // Call the parent-provided markAsRead function
    setCurrentPage(Math.ceil(sortedEmails.length / emailsPerPage)); // Move to the last page
  };

  const handleShowBody = (email) => {
    setSelectedEmail(email); // Set the selected email
  };

  const handleCloseBodyView = () => {
    setSelectedEmail(null); // Clear the selected email
  };

  return (
    <div className="email-list">
      <div className="email-cards">
        {currentEmails.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            markAsRead={handleMarkAsRead} // Use the local handler
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

      {/* Email Body View */}
      {selectedEmail && (
        <div className="email-body-modal">
          <div className="email-body-content">
            <button className="close-modal" onClick={handleCloseBodyView}>
              &times; {/* Close button */}
            </button>
            <h4>{selectedEmail.subject}</h4>
            <p>{selectedEmail.body}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailList;
