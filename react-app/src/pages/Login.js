import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleChange = (event) => {
    if (event.target.name === "email") {
      setEmail(event.target.value);
    } else if (event.target.name === "password") {
      setPassword(event.target.value);
    }
  };

  const history = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Validate email and password
    if (email === "example@email.com" && password === "password123") {
      // Redirect to dashboard page
      history.push("/dashboard");
    } else {
      alert("Invalid email or password");
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
            <form onSubmit={handleSubmit} className="login--form">
              <div>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
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
              <button type="submit" className="button ">Sign In</button>
            </form>
          </div>

      </div>
      <Footer />
    </div>
  );
}
