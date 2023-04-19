import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import questionData from '../databases/questions_overview.json';

export default function Dashboard() {
        const jsonElements = Object.entries(questionData).map(([key, value]) => (
          <div key={key} className="dashboard--question--entry">
            <div className="question">{key}</div>
            <div>{value[0]}</div>
            <div className="dashboard--download--img"></div>
          </div>
        ));

  return (
    <div className="container">
      <NavBar />
      <div className="dashboard">
        <div className="dashboard--overview">
            <div className="dashboard--overview--create">
                <a>
                    <button className="button dashboard--button">
                        <div className="dashboard--img"></div>
                        Create
                        </button>
                </a>
            </div>
            <div className="dashboard--overview--content">
                <div>
                    <h2>Total Responses</h2>
                    <h3>100,000</h3>
                </div>
                <div>
                    <h2>Live Questions</h2>
                    <h3>3/52</h3>
                </div>
            </div>
        </div>
        <div className="dashboard--projects">
            <div className="dashboard--overview--hello"> <h2>Hello USER!</h2> </div>
                <div className="dashboard--overview--questions"> <div>
                    <div className="dashboard--question--entry">
                        <div className="question">Statement</div>
                        <div>Completed</div>
                        <div>Download</div>
                    </div>
                    {jsonElements}
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
