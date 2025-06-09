const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-700 text-white p-4 text-center mt-auto">
      <div className="container mx-auto">
        <p>&copy; HTAgency Academy {currentYear}</p>
      </div>
    </footer>
  );
};

export default Footer;
