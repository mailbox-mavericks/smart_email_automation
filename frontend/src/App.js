import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import EmailList from "./components/EmailList";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";
import "./App.css"; // Add this line for custom styles

const App = () => {
    const [emails, setEmails] = useState([]);
    const [filteredEmails, setFilteredEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all"); // Track filter type: 'all', 'read', 'unread'
    const [searchQuery, setSearchQuery] = useState(""); // Track search input

    useEffect(() => {
        fetchEmails();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [filter, emails, searchQuery]);

    const API_BASE_URL =
        process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000"
            : "https://smart-email-automation.onrender.com";

    const fetchEmails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/read_all`);
            const sortedEmails = sortEmails(response.data);
            setEmails(sortedEmails);
            setFilteredEmails(sortedEmails); // Ensure filtered emails stay in sync
        } catch (err) {
            setError("Failed to fetch emails.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const refreshEmails = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE_URL}/refresh_page`);
            const sortedEmails = sortEmails(response.data);
            setEmails(sortedEmails);
            setFilteredEmails(sortedEmails);
        } catch (err) {
            setError("Failed to refresh emails.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sortEmails = (emailList) => {
        // Sort emails first by isRead (unread first), then by priority (High > Medium > Low)
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return [...emailList].sort((a, b) => {
            if (a.isRead !== b.isRead) {
                return a.isRead - b.isRead; // Unread first
            }
            return priorityOrder[a.priority] - priorityOrder[b.priority]; // Sort by priority
        });
    };

    const applyFilter = () => {
        let filtered = emails;

        // Apply filter based on read/unread
        if (filter === "read") {
            filtered = emails.filter((email) => email.isRead);
        } else if (filter === "unread") {
            filtered = emails.filter((email) => !email.isRead);
        }

        // Apply search query
        if (searchQuery.trim() !== "") {
            filtered = filtered.filter(
                (email) =>
                    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    email.body.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredEmails(filtered);
    };

    const handleSearch = (query) => {
        setSearchQuery(query); // Update search query state
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/read_all/${id}/mark-as-read`);

            const updatedEmails = emails.map((email) =>
                email.id === id ? { ...email, isRead: true } : email
            );

            const sortedEmails = sortEmails(updatedEmails);
            setEmails(sortedEmails);
            setFilteredEmails(sortedEmails);
        } catch (err) {
            console.error(`Failed to mark email ${id} as read:`, err);
        }
    };

    const generateResponse = async (email) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/generate_response`, {
                subject: email.subject,
                body: email.body,
            });
            alert(`Response generated: ${response.data.message}`);
        } catch (err) {
            console.error("Error generating response:", err);
            alert("Failed to generate response. Please try again.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="app-container">
            <Sidebar />
            <div className="content-container">
                <h1 className="text-center mb-4">Emails Dashboard</h1>
                <SearchBar onSearch={handleSearch} />
                <FilterBar filter={filter} setFilter={setFilter} />
                <div className="email-list-container">
                    <EmailList
                        emails={filteredEmails}
                        markAsRead={markAsRead}
                        generateResponse={generateResponse} // Pass the generate response handler
                    />
                </div>
                <div className="text-center mt-4">
                    <button onClick={refreshEmails} className="btn btn-primary">
                        Refresh Emails
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
