import React from "react";
import ReactMarkdown from "react-markdown";
import ethicsContent from "../../content/ethics.md";
import "./ethics.css";

export default function Ethics() {
  return (
    <div>
      <div className="ethics">
        <div className="ethics--container">
          <div className="ethics--content">
            <ReactMarkdown>{ethicsContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
