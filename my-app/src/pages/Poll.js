import React from "react";
import NavBar from "../components/NavBar";
import CountdownTimer from "../components/CountdownTimer";
import PollForm from "../components/PollForm";
import Footer from '../components/Footer';

export default function Poll() {
  return (
    <div>
      <NavBar />
    <div className="poll--outer">
    <div className="poll--total">
      <div className="poll--padding"></div>
      <div className="poll">
        <div className="poll--box">
          <div className="poll--question">
            Science has put it beyond reasonable doubt that COVID-19 is caused
            by a virus.
          </div>
        <PollForm />
        </div>
      </div>
      <div className="poll--padding"></div>
      <div className="poll--padding"></div>
      <div className="poll--padding"></div>
    </div>
    </div>
    <Footer />
    </div>
  );
}
