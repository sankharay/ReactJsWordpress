const Footer = () => {
  return (
    <div className="p-8">
      <div className="text-neutral-500 text-center">
        &copy; Copyright{" "}
        <a
          href="https://isawrisk.com"
          className="font-bold text-rose-400"
        >
          isawrisk.com
        </a>
        {", "}
        2024.{" "}
        <a
          href="mailto:othy.tenk@gmail.com"
          className="font-semibold text-neutral-500"
        >
          Send email
        </a>
      </div>
    </div>
  );
};

export default Footer;
