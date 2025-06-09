import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          HTAgency Academy
        </Link>
        <nav>
          <Link href="/" className="hover:text-gray-300">
            Courses
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
