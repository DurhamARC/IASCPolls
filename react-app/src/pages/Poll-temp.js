import React from "react";
import NavBar from "../components/NavBar";
import PollForm from "../components/PollForm";
import Footer from '../components/Footer';

export default function PollTemp() {
  return (
    <div className="poll--total">
      <div className="background-blur"></div>
      <div className="background-blur mirror"></div>
      <NavBar />
        <div className="poll">
          <div className="poll--box">
            <div className="poll--blurb">
              Please read the following statement carefully and answer with a response that aligns with your perspective on the given topic.
            </div>
            <div className="poll--question">
              Science has put it beyond reasonable doubt that COVID-19 is caused by a virus.
            </div>
            <PollForm/>
          </div>
        </div>
      <Footer />
      </div>
  );
}
