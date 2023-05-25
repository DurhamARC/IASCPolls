import React from "react";

export default function Alert({ title, severity, children }) {
  return (
    <div className={`alert alert--${severity}`}>
      <span className="alert--title">{title}</span>
      <span className="alert--message">{children}</span>
    </div>
  );
}
