import React from "react";

export default function Alert({ title, severity, children }) {
  // Possible values for severity: error, warning, info
  return (
    <div className={`alert alert--${severity}`}>
      <div className="alert--symbol alert--dismiss">
        <span className="material-symbols-outlined">close</span>
      </div>
      <div className="alert--symbol">
        <span className="material-symbols-outlined">{severity}</span>
      </div>
      <div className="alert--body">
        <h4 className="alert--title">{title}</h4>
        <span className="alert--message">{children}</span>
      </div>
    </div>
  );
}
