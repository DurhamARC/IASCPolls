import React, { useLayoutEffect, useState } from "react";
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
      console.log(window.innerWidth <= 768);
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
            Institute for Ascertaining Scientific Consensus
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
            <h2>What is IASC?</h2>
            <p>
              The Institute for Ascertaining Scientific Consensus (IASC) is a
              global network that can email over 100,000 scientists with a
              specific statement of interest, such as &ldquo;Covid is caused by
              a virus&rdquo;, and request an agree/disagree response within two
              minutes. The responses will be instantly and anonymously recorded
              in a database, allowing for the calculation of the strength of
              consensus. This network will be a valuable resource for
              policymakers and the general public in discerning the level of
              agreement among scientists on various issues and combating
              misinformation. It will also provide insight into cross-cultural
              differences in scientific opinions.
            </p>
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
        <div className="home--ethics--content">
          <h2>Ethics and Anonymisation</h2>
          <p>
            We are committed to guaranteeing the anonymity of all survey
            participants to ensure their safety in expressing their opinions.
          </p>
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
