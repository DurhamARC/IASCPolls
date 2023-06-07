import React from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  const path = useLocation().pathname.substring(1);

  // Array of path locations where footer should be hidden
  const hide = ["poll", "thankyou"];
  if (hide.includes(path)) return null;

  return (
    <AuthConsumer>
      {({ isAuth }) => (
        <nav className="footer">
          <div>
            <NavLink to="/ethics" state={{ last: path }}>
              Ethics
            </NavLink>
            <NavLink to="/about" state={{ last: path }}>
              About
            </NavLink>
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
