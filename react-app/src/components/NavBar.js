import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from "../components/AuthContext";

export default function NavBar() {
  const { isAuth, setAuth, currentUser, setCurrentUser } = useContext(AuthContext);

  return (
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
          {isAuth ? (
            <a href="/logout">Logout</a>
          ) : (
            <a href="/login">Login</a>
          )}
        </li>
    </nav>
  );
}
