import React, {useContext, useState} from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

import { AuthContext } from "../components/AuthContext";
import { client } from "../App";


export default function Login() {
  // not using isAuth or currentUser, indexes 0,2 in below import
  const {isAuth, setAuth, currentUser, setCurrentUser} = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleChange = (event) => {
    if (event.target.name === "username") {
      setUsername(event.target.value);
    } else if (event.target.name === "password") {
      setPassword(event.target.value);
    }
  };

  const navigate = useNavigate();

  const submitLogin = (event) => {
    event.preventDefault();
    // Validate username and password
    if (username.length && password.length) {

      client.post(
          "/api/login",
          {
            username: username,
            password: password
          }
      ).then((res) => {
        setCurrentUser(username);
        setAuth(true);

        // Redirect to dashboard page
        navigate("/dashboard");
      });

    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="container login--container">
      <NavBar />
      <div className="login-box">
        <div className="login--content">
            <div className="home-pic login--pic"></div>
          <div>
            <h1>Login</h1>
          </div>
            <form onSubmit={e => submitLogin(e)} className="login--form">
              <div>
                <label htmlFor="username">Username</label>
                <input
                  type="username"
                  id="username"
                  name="username"
                  value={username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="button">Sign In</button>
            </form>
          </div>

      </div>
      <Footer />
    </div>
  );
}
