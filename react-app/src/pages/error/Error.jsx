import React from "react";
import { useLocation } from "react-router-dom";
import "./error.css";

export default function Error() {
  const location = useLocation();
  const message = location.state?.message || "An unexpected error occurred.";

  return (
    <div className="container centered">
      <div className="error--container">
        <h1>Something went wrong</h1>
        <p>{message}</p>
        <hr />
        <p>
          Why not try going back to the <a href="/">homepage?</a>
        </p>
      </div>
    </div>
  );
}
