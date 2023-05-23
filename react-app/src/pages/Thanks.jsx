import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function Thanks() {
  return (
    <div className="thankyou--container">
      <NavBar />
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
              <a href="/ethics"> please follow this link. </a>
            </p>
            <p>Once again, thank you for your support.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
