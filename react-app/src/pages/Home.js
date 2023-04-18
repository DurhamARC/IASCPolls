import React from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

function Home(){
    return (
        <div>
        <NavBar />
        <div className="home--container">
            <div className="home">
                <div>
                    <h1 className="home--title">Institute for Ascertaining Scientific Consensus</h1>
                </div>
            </div>
            <div className="home-pic">
            </div> 
        </div>
        <div className="home--container">
            <div className="home--about">
                <h2>
            We aim to set up a hub-and-spoke, international network provisionally titled ‘The Institute for Ascertaining Scientific Consensus’ (IASC). IASC will be capable of emailing >100,000 scientists, asking for an agree/disagree response regarding a specific statement of interest, a candidate scientific fact such as ‘Covid is caused by a virus’. Emails will be sent internally within each participating institution, by a spoke representative, and the time-demand to read the email and respond will be less than two minutes. In this way the response rate will be very high, compared with the usual scientific opinion surveys. The responses will be instantly and anonymously recorded in a database, and the strength of consensus calculated. The network will be humanity’s premier means for measuring strength of scientific consensus regarding a specific statement of interest. It will thus stand as a useful tool for policymakers, especially given the proven[1] ability of consensus announcements to influence opinions and actions. It will also serve to inform laypersons, fighting against ‘fake news’ and misinformation. In other cases, it will serve to illuminate where experts in different countries, or different parts of the world, see things differently.
                </h2>
            </div> 
        </div>
        <Footer />
        </div>

    )
}

export default Home;
