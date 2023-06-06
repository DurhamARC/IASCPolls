import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthConsumer } from "../AuthContext";
import Logout from "../logout/Logout";
import ReturnNotice from "../ReturnNotice";
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
  const path = useLocation().pathname.substring(1);
  const location = useLocation();
  let last = "";

  if (location && location.state !== null) last = location.state.last;

  /*
   * Attach a CSS class for the page we are on
   */
  const cssClass = (() => {
    let cls = "";
    if (className) cls += `nav-${className} `;

    if (path === "") {
      cls += "nav-index";
    } else {
      cls += `nav-${path}`;
    }

    return cls;
  })();

  /*
   * If we navigated here from the poll page, ask
   * the user to return there.
   */
  if (last === "poll")
    return (
      <>
        <ReturnNotice />

        <nav>
          <div className="site-title">
            <NavLink to="/" state={{ last: path }} className="nav-logo" />
          </div>
        </nav>
      </>
    );

  /*
   * Otherwise, render the NavBar
   */
  return (
    <AuthConsumer>
      {({ isAuth }) => (
        <nav className={`${cssClass}`}>
          <div className="site-title">
            <NavLink to="/" state={{ last: path }} className="nav-logo" />
          </div>
          <div>
            {
              // Hide Home tab on Poll page
              path !== "poll" && (
                <NavLink to="/" state={{ last: path }}>
                  Home
                </NavLink>
              )
            }
            <NavLink to="/about" state={{ last: path }}>
              About
            </NavLink>
            <NavLink to="/ethics" state={{ last: path }}>
              Ethics
            </NavLink>
            {isAuth && (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <Logout to="/logout">Logout</Logout>
              </>
            )}
          </div>
        </nav>
      )}
    </AuthConsumer>
  );
}
