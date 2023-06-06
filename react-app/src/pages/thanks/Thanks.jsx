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
              Thank you for participating in our beta test. Your input and
              feedback have been invaluable in helping us shape and improve the
              Institute for Ascertaining Scientific Consensus. We greatly
              appreciate your time and effort. If you&apos;d like to learn more
              about the research and development behind IASC,
              <a href="https://www.durham.ac.uk/research/institutes-and-centres/humanities-engaging-science-society/the-institute-for-ascertaining-scientific-consensus/">
                {" "}
                please visit the Institute webpage.{" "}
              </a>
            </p>
            <p>Once again, thank you for your support.</p>
            <p>
              For enquiries, comments and feedback, please contact{" "}
              <a href="mailto:Institute for Ascertaining Scientific Consensus <iasc@durham.ac.uk>">
                The Institute for Ascertaining Scientific Consensus
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
