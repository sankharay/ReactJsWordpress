import Footer from "./Footer";
import Header from "./Header";
import Footernavigation from './Footernavigation';
import "../assets/css/Global.css";


/* eslint-disable react/prop-types */
const Container = ({ children }) => {
  return (
    <div className="container mx-auto p-8">
      <Header />
      <div className="py-89 main-page-continer">{children}</div>
      <hr />
      <Footer />
      <Footernavigation />
    </div>
  );
};

export default Container;
