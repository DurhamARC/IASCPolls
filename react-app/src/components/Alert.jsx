import React from "react";

export default function Alert({ id, title, severity, callback, children }) {
  const myCallback = () => {
    callback(id);
  };

  // Possible values for severity: error, warning, info
  return (
    <div className={`alert alert--${severity} animate-entry`}>
      <div
        className="alert--symbol alert--dismiss"
        role="button"
        tabIndex={0}
        onClick={myCallback}
        onKeyUp={myCallback}
      >
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
