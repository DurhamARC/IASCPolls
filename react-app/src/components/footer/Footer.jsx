import React from "react";
import "./footer.css";

export default function Footer() {
  return (
    <nav className="footer">
      <p>Institute for Ascertaining Scientific Consensus</p>
      <li>
        <a href="/ethics">Ethics</a>
        <a href="/about">About</a>
      </li>
    </nav>
  );
}
