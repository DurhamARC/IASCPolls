import React from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function Login(){
    return (
        <div className="container login--container">
            <NavBar />
            <div className="login-box">
                <div>
                login box
                </div>
            </div>
            <Footer />
        </div>
    )
};