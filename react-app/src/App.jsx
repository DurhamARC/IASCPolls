// import logo from './logo.svg';
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import { ErrorBoundary } from "react-error-boundary";
import Home from "./pages/home/Home";
import Poll from "./pages/survey/Survey";
import About from "./pages/about/About";
import Thanks from "./pages/thanks/Thanks";
import Ethics from "./pages/ethics/Ethics";
import Error from "./pages/error/Error";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import DownloadParticipants from "./pages/download/DownloadParticipants";
import { AuthProvider } from "./components/AuthContext";
import { MessageProvider } from "./components/MessageHandler";
import Alert from "./components/Alert";

function fallbackRender({ error }) {
  return (
    <Alert title="Something went wrong" severity="error">
      {error.message}
    </Alert>
  );
}

function App() {
  return (
    <div className="App">
      <ErrorBoundary fallbackRender={fallbackRender}>
        <MessageProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/poll" element={<Poll />} />
                <Route path="/about" element={<About />} />
                <Route path="/thankyou" element={<Thanks />} />
                <Route path="/ethics" element={<Ethics />} />
                <Route path="/error" element={<Error />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/download" element={<DownloadParticipants />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </MessageProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;

// /login - make sure to adimn
// /ethics
// /poll with poll id {pollId: r00000, pollQuestion:"A question?"}
// GET /api/poll?pollId=r00000?uniqueId=1234567890
// POST /api/poll?pollId=r00000?uniqueId=1234567890?answer=1
// if unique id doesn't exist then give page that says already used/ invalid

// Inter Link:
//   <link rel="preconnect" href="https://fonts.googleapis.com">
//     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//       <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap" rel="stylesheet"></link>

//       font-family: 'Inter', sans-serif;

// Inter import
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap');
// font-family: 'Inter', sans-serif;
