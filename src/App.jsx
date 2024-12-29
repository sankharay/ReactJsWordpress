import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "./pages/home/Home";
import AboutPage from "./pages/about/About";
import ContactPage from "./pages/contact/Contact";
import BlogDetails from "./pages/blog/BlogDetails";
import Category from "./pages/category/Category";
import Rat from "./pages/rat/Rat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog/:blogSlug" element={<BlogDetails />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/rat" element={<Rat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
