import Container from "../../components/Container";
import Blogs from "../../components/home/Blogs";
import Categories from "../../components/home/Categories";
import CustomMaps from "../../components/maps/CustomMap";

const HomePage = () => {
  return (
    <div className="main-container">
      <Container>
        <section className="map-container flex flex-col md:flex-row gap-8">
          <CustomMaps />
          {/* <Blogs />
        <Categories /> */}
        </section>
      </Container>
    </div>
  );
};

export default HomePage;
