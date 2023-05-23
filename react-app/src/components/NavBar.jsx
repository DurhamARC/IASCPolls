import React from "react";
import { AuthConsumer } from "./AuthContext";

export default function NavBar() {
  return (
    <AuthConsumer>
      {({ isAuth }) => (
        <nav className="nav">
          <div>
            <a className="site-title" href="/">
              Institute for Ascertaining Scientific Consensus
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
