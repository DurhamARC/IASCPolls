import React from "react";
import "./thanks.css";

export default function Thanks() {
  return (
    <div className="thankyou--container">
      <div className="container centered">
        <div className="thankyou">
          <h1>Thank you for your participation!</h1>
          <div>
            <p>
              We greatly appreciate your time and effort. If you&apos;d like to
              learn more about the research and development behind C-SCOPE,
              <a href="/"> please visit the C-SCOPE webpage. </a>
            </p>
            <p>Once again, thank you for your support.</p>
            <p>
              For enquiries, comments and feedback, please contact{" "}
              <a href="mailto:The Centre for Scientific Community Opinion Polling and Evaluation <iasc@durham.ac.uk>">
                The Centre for Scientific Community Opinion Polling and
                Evaluation
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
