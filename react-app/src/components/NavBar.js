import '../App.css';

export default function NavBar(){
    return(
    <nav className="nav">
        <div>
        <a className="site-title" href="/">Institute for Ascertaining Scientific Consensus</a>
        </div>
        <li>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/ethics">Ethics</a>
            <a href="/login">Login</a>
        </li>
    </nav>
    )
}