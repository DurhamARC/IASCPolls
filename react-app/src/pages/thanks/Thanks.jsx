import React from "react";
import ReactMarkdown from "react-markdown";
import thanksContent from "../../content/thanks.md";
import "./thanks.css";

export default function Thanks() {
  return (
    <div className="thankyou--container">
      <div className="container centered">
        <div className="thankyou">
          <ReactMarkdown>{thanksContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
