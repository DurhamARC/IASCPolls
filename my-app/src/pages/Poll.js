import React from "react";
import NavBar from "../components/NavBar";
import CountdownTimer from "../components/CountdownTimer";
import PollForm from "../components/PollForm";

export default function Poll() {
  return (
    <div>
      <NavBar />
      <div className="poll">
        <div className="poll--box">
          <div className="poll--timer">
            <CountdownTimer initialTime={120} />
          </div>
          <h1 className="poll--question">
            Science has put it beyond reasonable doubt that COVID-19 is caused
            by a virus.
          </h1>
        <PollForm />
        </div>
      </div>
    </div>
  );
}
