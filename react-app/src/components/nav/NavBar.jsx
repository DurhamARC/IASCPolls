import React from "react";
import { AuthConsumer } from "../AuthContext";
import "./nav.css";

export default function NavBar() {
  return (
    <AuthConsumer>
      {({ isAuth }) => (
        <nav className="nav">
          <div className="site-title">
            <a href="/">
              <div className="nav-logo" />
            </a>
          </div>
          <li>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/ethics">Ethics</a>
            {isAuth ? <a href="/logout">Logout</a> : <a href="/login">Login</a>}
          </li>
        </nav>
      )}
    </AuthConsumer>
  );
}
