import React from "react";

export const AuthContext = React.createContext(null);

class AuthProvider extends React.Component {
  constructor(props) {
    // Required step: always call the parent class' constructor
    super(props);

    this.state = {
      isAuth: false,
      currentUser: null,
    };
  }

  setCurrentUser = (e) => {
    this.setState({ currentUser: e });
  };

  setAuth = (e) => {
    this.setState({ isAuth: e });
  };

  render() {
    const {isAuth, currentUser} = this.state;
    const {children} = this.props;

    return (
      <AuthContext.Provider
        value={{
          isAuth,
          setAuth: this.setAuth,
          currentUser,
          setCurrentUser: this.setCurrentUser,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
}

const AuthConsumer = AuthContext.Consumer;
export { AuthProvider, AuthConsumer };
