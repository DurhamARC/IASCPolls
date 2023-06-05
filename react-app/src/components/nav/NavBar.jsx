import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthConsumer } from "../AuthContext";
import "./nav.css";

export default function NavBar({ className }) {
  const location = useLocation().pathname.substring(1);

  const cssClass = (() => {
    let cls = "";
    if (className) cls += `nav-${className} `;

    if (location === "") {
      cls += "nav-index";
    } else {
      cls += `nav-${location}`;
    }

    return cls;
  })();

  return (
    <AuthConsumer>
      {({ isAuth }) => (
        <nav className={`nav ${cssClass}`}>
          <div className="site-title">
            <NavLink to="/" className="nav-logo" />
          </div>
          <li>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/ethics">Ethics</NavLink>
            <NavLink to={isAuth ? "/logout" : "/login"}>
              {isAuth ? "Logout" : "Login"}
            </NavLink>
          </li>
        </nav>
      )}
    </AuthConsumer>
  );
}
