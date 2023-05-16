// import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Poll from './pages/Survey';
import About from './pages/About';
import Thanks from './pages/Thanks';
import Ethics from './pages/Ethics';
import Error from './pages/Error';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Create from './pages/Create';

import axios from "axios";
import {AuthProvider} from "./components/AuthContext";

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.withCredentials = true;

export const client = axios.create({});

function App() {

  return (
    <div className="App">
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
          <Route path="/create" element={<Create />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
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