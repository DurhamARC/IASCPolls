import React from "react";
import NavBar from "../components/NavBar";

export default function Thanks() {
  return (
    <div>
      <NavBar />
      <div className="thankyou">
        <div className="thankyou--title">Thank you for your participation!</div>
        <div>
          <h2 className="thankyou--para">Thank you for participating in our beta test. Your input and feedback have been invaluable 
            in helping us shape and improve our product. We greatly appreciate your time and effort. If you'd like to learn more 
            about the research and development behind our product, <a href="/ethics"> please follow this link. </a> </h2>
          <h2 className="thankyou--para">Once again, thank you for your support.</h2>
        </div>
      </div>
    </div>
  )
};