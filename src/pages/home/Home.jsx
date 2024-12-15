import Container from "../../components/Container";
import Blogs from "../../components/home/Blogs";
import Categories from "../../components/home/Categories";
import CustomMaps from "../../components/maps/CustomMap";

const HomePage = () => {
  return (
    <Container>
      <section className="map-container flex flex-col md:flex-row gap-8">
        <CustomMaps />
        {/* <Blogs />
        <Categories /> */}
      </section>
    </Container>
  );
};

export default HomePage;
