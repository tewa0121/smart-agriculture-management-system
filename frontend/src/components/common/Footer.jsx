import React from "react";

const Footer = () => {
  return (
    <footer className="text-center py-4 text-muted small border-top mt-auto">
      <div className="container">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Smart Agriculture Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;