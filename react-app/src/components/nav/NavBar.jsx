import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthConsumer } from "../AuthContext";
import "./nav.css";

/**
 * Render the site NavBar
 *
 * Uses NavLinks from React-Router to allow styling links
 * based on their 'active' class. This works because NavBar
 * is a child of the <BrowserRouter> element in App.jsx
 * @param className
 * @returns {JSX.Element}
 * @constructor
 */
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
          <div>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/ethics">Ethics</NavLink>
            {isAuth && (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/logout">Logout</NavLink>
              </>
            )}
          </div>
        </nav>
      )}
    </AuthConsumer>
  );
}
