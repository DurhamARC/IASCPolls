import React, { useMemo, useState } from "react";

export const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuth, setAuth] = useState(null);

  const contextValue = useMemo(
    () => ({
      isAuth,
      setAuth,
      currentUser,
      setCurrentUser,
    }),
    [isAuth, setAuth, currentUser, setCurrentUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

const AuthConsumer = AuthContext.Consumer;
export { AuthProvider, AuthConsumer };
