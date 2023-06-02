import React from "react";
import NavBar from "../../components/nav/NavBar";
import Footer from "../../components/footer/Footer";
import "./home.css";
import mobileFrontPage from "../../imgs/mobile-front-page.png";
import frontPageComp from "../../imgs/balance.png";
import frontPageScientists from "../../imgs/scientists-shaking-hands.png";
import magnifyingGlassScientistsBackground from "../../imgs/magnifying-glass-scientists-background.png";

function Home() {
  const isMobile = window.innerWidth <= 768; // Check if the window width is less than or equal to 768px

  return (
    <div className="home-all">
      <NavBar />
      <div className="container home--container">
        <div>
          <div>
            <h1 className="home--title">
              Institute for Ascertaining Scientific Consensus
            </h1>
          </div>
        </div>
        <div>
          <div
            className={isMobile ? "home-pic-mobile" : "home-pic"}
            style={{
              backgroundImage: `url(${
                isMobile ? mobileFrontPage : magnifyingGlassScientistsBackground
              })`,
            }}
          />
        </div>
      </div>

      <div className="container home--about--container">
        <div
          className="home-pic-3"
          style={{ backgroundImage: `url(${frontPageScientists})` }}
        >
          <div className="home--about--overlay">
            <div className="home--about--text">
              <h2>What is IASC?</h2>
              <h3>
                The Institute for Ascertaining Scientific Consensus (IASC) is a
                global network that can email over 100,000 scientists with a
                specific statement of interest, such as &ldquo;Covid is caused
                by a virus&rdquo;, and request an agree/disagree response within
                two minutes. The responses will be instantly and anonymously
                recorded in a database, allowing for the calculation of the
                strength of consensus. This network will be a valuable resource
                for policymakers and the general public in discerning the level
                of agreement among scientists on various issues and combating
                misinformation. It will also provide insight into cross-cultural
                differences in scientific opinions.
              </h3>
              <div>
                <a href="./about">
                  <button type="button" className="button home--button">
                    Find Out More
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container home--ethics--container">
        <div>
          <div
            className="home-pic-2"
            style={{ backgroundImage: `url(${frontPageComp})` }}
          />
        </div>
        <div>
          <div className="home--ethics--content">
            <h1>Ethics and Anonymisation</h1>
            <h2>
              We are committed to guaranteeing the anonymity of all survey
              participants to ensure their safety in expressing their opinions.
            </h2>
            <div>
              <a href="./ethics">
                <button type="button" className="button home--button">
                  Explore
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
