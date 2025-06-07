import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-slate-800 text-white py-4 px-6 shadow-md"> {/* Changed bg-gray-800 to bg-slate-800 to match shadcn theme, increased padding slightly */}
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl sm:text-2xl font-bold hover:text-slate-200 transition-colors"> {/* Added hover effect and responsive text size */}
          HTAgency Academy
        </Link>
        <nav>
          <Link href="/" className="text-slate-50 hover:text-slate-300 transition-colors text-sm sm:text-base"> {/* Adjusted link color for better contrast with slate-800, responsive text */}
            Courses
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
