import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import "./logout.css";

export default function Logout({ to, children }) {
  const navigate = useNavigate();
  const { setAuth, setCurrentUser } = useContext(AuthContext);

  const logout = () => {
    setAuth(false);
    setCurrentUser(null);
    navigate(to);
  };

  return (
    <button type="button" onClick={logout}>
      {children}
    </button>
  );
}
