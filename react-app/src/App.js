// import logo from './logo.svg';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home'
import Poll from './pages/Poll'
import About from './pages/About'
import Thanks from './pages/Thanks'
import Ethics from './pages/Ethics'


function App() {
  return (
    <body>
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/poll" element={<Poll />} />
          <Route path="/about" element={<About />} />
          <Route path="/thankyou" element={<Thanks />} />
          <Route path="/ethics" element={<Ethics />} />
        </Routes>
      </BrowserRouter>
    </div>
    </body>
  );
}

// /login - make sure to adimn
// /ethics
// /poll with poll id {pollId: r00000, pollQuestion:"A question?"} 
// GET /api/poll?pollId=r00000?uniqueId=1234567890
// POST /api/poll?pollId=r00000?uniqueId=1234567890?answer=1
// if unique id doesn't exist then give page that says already used/ invalid


export default App;

// Inter Link:
//   <link rel="preconnect" href="https://fonts.googleapis.com">
//     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//       <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap" rel="stylesheet"></link>

//       font-family: 'Inter', sans-serif;

// Inter import
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap');
// font-family: 'Inter', sans-serif;