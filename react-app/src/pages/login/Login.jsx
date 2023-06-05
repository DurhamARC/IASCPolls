import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import "./login.css";

import { AuthContext } from "../../components/AuthContext";
import { client } from "../../Api";

export default function Login() {
  const { setAuth, setCurrentUser } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (event) => {
    if (event.target.name === "username") {
      setUsername(event.target.value);
    } else if (event.target.name === "password") {
      setPassword(event.target.value);
    }
  };

  const navigate = useNavigate();
  const maxErrorLength = 250;

  const submitLogin = (event) => {
    event.preventDefault();
    // Validate username and password
    if (username.length && password.length) {
      client
        .post("/login", {
          username,
          password,
        })
        .then(() => {
          setCurrentUser(username);
          setAuth(true);

          // Redirect to dashboard page
          navigate("/dashboard");
        })
        .catch((err) => {
          console.log(err.response.data);
          if (typeof err.response.data === "object") {
            setPasswordError(err.response.data[0]);
            return;
          }
          setPasswordError(err.response.data.substring(0, maxErrorLength));
        });
    } else {
      setPasswordError("Invalid username or password");
    }
  };

  return (
    <div className="container login--container">
      <div className="login-box">
        <div className="login--content">
          <div className="login--pic" />
          <div>
            <h1>Login</h1>
          </div>
          <form onSubmit={submitLogin} className="login--form">
            <div>
              <label htmlFor="username">
                Username
                <input
                  type="username"
                  id="username"
                  name="username"
                  value={username}
                  onChange={handleChange}
                />
              </label>
            </div>
            <div>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  style={{ borderColor: passwordError ? "red" : "" }}
                />
              </label>
              {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
            </div>
            <button type="submit" className="button">
              Sign In
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
