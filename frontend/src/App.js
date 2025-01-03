import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import EmailList from "./components/EmailList";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";
import "./App.css"; 
//This and below are for authentication
import {handleSignIn} from "./Auth_service/auth_service";
import {handleSignUp} from "./Auth_service/auth_service";
import { signOutUser } from "./Auth_service/auth_service";


const App = () => {

    const [emails, setEmails] = useState([]);
    const [filteredEmails, setFilteredEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all"); // Track filter type: 'all', 'read', 'unread'
    const [searchQuery, setSearchQuery] = useState(""); // Track search input

    // For authentication
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    //for authentication
    const styles = {
      container: {
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      formContainer: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '24rem'
      },
      title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '1.5rem'
      },
      formGroup: {
        marginBottom: '1rem'
      },
      label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '0.25rem'
      },
      input: {
        width: '100%',
        padding: '0.5rem 0.75rem',
        borderRadius: '4px',
        border: '1px solid #d1d5db',
        outline: 'none'
      },
      button: {
        width: '100%',
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '0.5rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        marginTop: '1rem'
      },
      toggleText: {
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#4b5563',
        marginTop: '1rem'
      },
      toggleButton: {
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        cursor: 'pointer',
        textDecoration: 'underline'
      },
      signOutButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '10px 20px',
        backgroundColor: '#f87171', // Red color for sign out
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }
  };
  //for authentication
  const onSignUp = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await handleSignUp(email, password);
      setIsSignedIn(true); // Automatically sign in after successful signup
    } catch (err) {
      setError(err.message); // Display error
    }
  };

  const onSignIn = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await handleSignIn(email, password);
      setIsSignedIn(true);
    } catch (err) {
      setError(err.message);
    }
  };
  //for authentication
  const signOut = async () => {
    try {
        await signOutUser();
        setIsSignedIn(false); // Set to false when user signs out
        setEmail('');  // Clear the email state
        setPassword('');  // Clear the password state
    } catch (err) {
        console.error("Error during sign out", err);
    }
};

    useEffect(() => {
        fetchEmails();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [filter, emails, searchQuery]);

    const API_BASE_URL =
        process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000"
            : "https://smart-email-automation-backend.onrender.com";

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
            // Update the backend to mark the email as read
            await axios.put(`${API_BASE_URL}/read_all/${id}/mark-as-read`);

            // Update the email state in the frontend
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="app-container">
          {isSignedIn ? (
            <>
              <Sidebar />

              <div className="content-container">
                  <h1 className="text-center mb-4">Emails Dashboard</h1>
                  <SearchBar onSearch={handleSearch} />
                  <FilterBar filter={filter} setFilter={setFilter} />
                  <div className="email-list-container">
                      <EmailList emails={filteredEmails} markAsRead={markAsRead} />
                  </div>
                  <div className="text-center mt-4">
                      <button onClick={refreshEmails} className="btn btn-primary">
                          Refresh Emails
                      </button>
                  </div>
              </div>
              {/* Sign out button */}
              <button style={styles.signOutButton} onClick={signOut}>
                Sign Out
              </button>
            </>
          ) : (
            <div style={styles.container}>
              <div style={styles.formContainer}>
                <h1 style={styles.title}>
                  {isLogin ? 'Login' : 'Sign Up'}
                </h1>
                
                <form onSubmit={isLogin ? onSignIn : onSignUp}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    style={styles.button}
                  >
                    {isLogin ? 'Login' : 'Sign Up'}
                  </button>
                </form>
                
                <div style={styles.toggleText}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    style={styles.toggleButton}
                  >
                    {isLogin ? 'Sign Up' : 'Login'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
    );
};

export default App;