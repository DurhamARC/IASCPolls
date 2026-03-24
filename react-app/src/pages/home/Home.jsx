import React, { useLayoutEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import homeWhatIsContent from "../../content/home-what-is.md";
import homeEthicsContent from "../../content/home-ethics.md";
import "./home.css";
import mobileFrontPage from "../../imgs/min/mobile-front-page.webp";
import frontPageComp from "../../imgs/min/balance.svg";
import frontPageScientists from "../../imgs/min/scientists-shaking-hands.webp";
import magnifyingGlassScientistsBackground from "../../imgs/min/magnifying-glass-scientists-background.webp";

function Home() {
  // Check if the window width is less than or equal to 768px
  const [isMobile, _setIsMobile] = useState(window.innerWidth <= 768);

  /**
   * Update isMobile when window is resized by hand
   */
  useLayoutEffect(() => {
    const setIsMobile = () => {
      _setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", setIsMobile);
  });

  /**
   * Render function JSX
   */
  return (
    <div className="home-all">
      <div className="container home--container">
        <div
          className={isMobile ? "home-pic-mobile" : "home-pic"}
          style={{
            backgroundImage: `url(${
              isMobile ? mobileFrontPage : magnifyingGlassScientistsBackground
            })`,
          }}
        />
        <div>
          <h1 className="home--title">
            C-SCOPE: <br />
            The Centre for Scientific Community Opinion Polling and Evaluation
          </h1>
        </div>
      </div>

      <div className="container home--about--container">
        <div
          className="home-pic-3"
          style={{ backgroundImage: `url(${frontPageScientists})` }}
        />
        <div className="home--about--overlay">
          <div className="home--about--text">
            <ReactMarkdown>{homeWhatIsContent}</ReactMarkdown>
            <a href="./about">
              <button type="button" className="button home--button">
                Find Out More
              </button>
            </a>
          </div>
        </div>
      </div>

      <div className="container home--ethics--container">
        <div
          className="home-pic-2"
          style={{ backgroundImage: `url(${frontPageComp})` }}
        />
        <div className="home--ethics--text">
          <ReactMarkdown>{homeEthicsContent}</ReactMarkdown>
          <a href="./ethics">
            <button type="button" className="button home--button">
              Explore
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
