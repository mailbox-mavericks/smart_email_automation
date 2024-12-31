import React from "react";
import "./Pagination.css";

const Pagination = ({ emailsPerPage, totalEmails, paginate, currentPage }) => {
    const pageNumbers = [];
    const totalPages = Math.ceil(totalEmails / emailsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="pagination-nav">
            <ul className="pagination">
                {pageNumbers.map((number) => (
                    <li
                        key={number}
                        className={`page-item ${number === currentPage ? "active" : ""}`}
                    >
                        <button
                            onClick={() => paginate(number)}
                            className="page-link"
                        >
                            {number}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Pagination;
