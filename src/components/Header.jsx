import Navigation from "./Navigation";
import Navmobile from "./Navmobile";
import Logo from "./Logo";
import HeaderRight from "./Headerright";
import "../assets/css/Header.css";
import "../assets/css/Global.css";


const Header = () => {
  return (
    <header>
      <div className="nav-mobile">
        <Navmobile />
        <Logo />
        <HeaderRight />
      </div>
      <div className="nav-desktop">
      <Navigation />
      </div>
    </header>
  );
};

export default Header;
