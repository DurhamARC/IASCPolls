import React, { useMemo, useState } from "react";

export const AuthContext = React.createContext(null);

/**
 * Context used for user authentication. Uses localStorage to persist
 * login status across page refreshes.
 *
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
function AuthProvider({ children }) {
  const [currentUser, _setCurrentUser] = useState(
    localStorage.getItem("currentUser")
  );
  const [isAuth, _setAuth] = useState(localStorage.getItem("isAuth"));

  /**
   * Override setAuth function from useState to persist value in localStorage
   * @param bool
   */
  const setAuth = (bool) => {
    _setAuth(bool);
    localStorage.setItem("isAuth", bool);
    if (!bool) localStorage.removeItem("isAuth");
  };

  /**
   * Override setCurrentUser function from useState to persist value in localStorage
   * @param username
   */
  const setCurrentUser = (username) => {
    _setCurrentUser(username);
    localStorage.setItem("currentUser", username);
    if (!username) localStorage.removeItem("currentUser");
  };

  /**
   * Use React Memo to cache the context; otherwise component re-render will cause issues
   * Returns the stored value from the last render (unless changed)
   * @type {{setCurrentUser: function(*): void, isAuth: string, setAuth: function(*): void, currentUser: string}}
   */
  const contextValue = useMemo(
    () => ({
      isAuth,
      setAuth,
      currentUser,
      setCurrentUser,
    }),
    [isAuth, setAuth, currentUser, setCurrentUser]
  );

  /**
   * Return JSX component
   */
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

const AuthConsumer = AuthContext.Consumer;
export { AuthProvider, AuthConsumer };
