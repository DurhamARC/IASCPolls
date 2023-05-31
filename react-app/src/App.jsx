// import logo from './logo.svg';
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import { ErrorBoundary } from "react-error-boundary";
import { AuthProvider } from "./components/AuthContext";
import { MessageProvider } from "./components/MessageHandler";
import Alert from "./components/Alert";

const Home = lazy(() =>
  import(/* webpackChunkName: "home" */ "./pages/home/Home")
);
const About = lazy(() =>
  import(/* webpackChunkName: "about" */ "./pages/about/About")
);
const Ethics = lazy(() =>
  import(/* webpackChunkName: "ethics" */ "./pages/ethics/Ethics")
);
const Poll = lazy(() =>
  import(/* webpackChunkName: "poll" */ "./pages/survey/Survey")
);
const Thanks = lazy(() =>
  import(/* webpackChunkName: "poll" */ "./pages/thanks/Thanks")
);
const Error = lazy(() =>
  import(/* webpackChunkName: "error" */ "./pages/error/Error")
);
const Login = lazy(() =>
  import(/* webpackChunkName: "login" */ "./pages/login/Login")
);
const Dashboard = lazy(() =>
  import(/* webpackChunkName: "dashboard" */ "./pages/dashboard/Dashboard")
);
const DownloadParticipants = lazy(() =>
  import(
    /* webpackChunkName: "dashboard" */ "./pages/download/DownloadParticipants"
  )
);

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
            <Suspense fallback={<div>Loading...</div>}>
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
            </Suspense>
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
