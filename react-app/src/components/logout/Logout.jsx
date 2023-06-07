import React, { useContext } from "react";
import { AuthContext } from "../AuthContext";
import "./logout.css";

export default function Logout({ to, children }) {
  const { setAuth, setCurrentUser } = useContext(AuthContext);

  const logout = () => {
    setAuth(false);
    setCurrentUser(null);
    // Navigate to Django logout route
    window.location.href = to;
  };

  return (
    <button type="button" onClick={logout}>
      {children}
    </button>
  );
}
