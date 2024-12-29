import Container from "../../components/Container";
import Chat from "../../components/rat/Rat";

const Rat = () => {
  return (
    <Container>
      <section>
        <h1 className="text-4xl font-semibold mb-8 text-center">RAT - Risk Assessment Tool</h1>
        <div className="max-w-2xl mx-auto">
          <Chat />
        </div>
      </section>
    </Container>
  );
};

export default Rat;
