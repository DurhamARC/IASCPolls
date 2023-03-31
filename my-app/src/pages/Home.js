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
                    <h1 className="home--title">The Institute for Ascertaining Scientific Consensus</h1>
                </div>
            </div>
            <div className="home--mobile">
                <ul>
                    <a href="/about"><li className="home--mobile--item">About</li></a>
                    <a href="/ethics"><li className="home--mobile--item">Ethics</li></a>
                    <a href="/login"><li className="home--mobile--item">Login</li></a>
                </ul>
            </div>
        </div>
        <Footer />
        </div>
    )
}

export default Home;
