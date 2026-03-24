import React from "react";
import ReactMarkdown from "react-markdown";
import aboutContent from "../../content/about.md";
import "./about.css";

export default function About() {
  return (
    <div>
      <div className="about--container">
        <div className="about">
          <ReactMarkdown>{aboutContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
