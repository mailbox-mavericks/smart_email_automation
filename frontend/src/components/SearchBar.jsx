import React from "react";

const SearchBar = ({ onSearch }) => {
    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search emails..."
                onChange={(e) => onSearch(e.target.value)}
                className="form-control"
            />
        </div>
    );
};

export default SearchBar;
