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
        <Footer />
        </div>

    )
}

export default Home;
