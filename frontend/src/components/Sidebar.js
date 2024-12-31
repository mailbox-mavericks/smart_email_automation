import React from "react";
import "./Sidebar.css";

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Dashboard</h2>
            </div>
            <div className="sidebar-user">
                <h4>User Info</h4>
                <ul>
                    <li><strong>Name:</strong> John Doe</li>
                    <li><strong>Email:</strong> john.doe@example.com</li>
                    <li><strong>Role:</strong> Admin</li>
                </ul>
            </div>
            <div className="sidebar-links">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Settings</a></li>
                    <li><a href="#">Support</a></li>
                </ul>
            </div>
            <div className="sidebar-footer">
                <p>&copy; 2024 Smart Email Automation</p>
            </div>
        </div>
    );
};

export default Sidebar;
