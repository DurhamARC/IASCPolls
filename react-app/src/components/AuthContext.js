import React from 'react';
export const AuthContext = React.createContext(null);

class AuthProvider extends React.Component {
    state = {
        isAuth: false,
        currentUser: null
    };

    setCurrentUser = e => {
        this.setState({currentUser: e})
    };

    setAuth = e => {
        this.setState({isAuth: e})
    };

    render() {
        return (
            <AuthContext.Provider
                value={{
                    isAuth: this.state.isAuth,
                    setAuth: this.setAuth,
                    currentUser: this.state.currentUser,
                    setCurrentUser: this.setCurrentUser
                }}
            >
                {this.props.children}
            </AuthContext.Provider>
        )
    }
}

const AuthConsumer = AuthContext.Consumer
export { AuthProvider, AuthConsumer }