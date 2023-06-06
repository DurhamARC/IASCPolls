import React from "react";
import { NavLink } from "react-router-dom";
import { AuthConsumer } from "../AuthContext";
import "./footer.css";
import Logout from "../logout/Logout";

/**
 * Render the site Footer.
 *
 * Uses AuthConsumer to provide isAuth status, to determine whether
 * to show the "Login" or "Logout" link. Direct child of Consumer
 * must be a function, as below: it cannot contain JSX elements.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Footer() {
  return (
    <AuthConsumer>
      {({ isAuth }) => (
        <nav className="footer">
          <div>
            <NavLink to="/ethics">Ethics</NavLink>
            <NavLink to="/about">About</NavLink>
            {isAuth ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <Logout to="/logout">Logout</Logout>
              </>
            ) : (
              <NavLink to="/login">Login</NavLink>
            )}
          </div>
        </nav>
      )}
    </AuthConsumer>
  );
}
