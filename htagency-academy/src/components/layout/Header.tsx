"use client"; // Required for useFavorites hook

import Link from 'next/link';
import { useFavorites } from '@/context/FavoritesContext'; // Import useFavorites

const Header = () => {
  const { favoriteIds } = useFavorites(); // Get favoriteIds for count

  return (
    <header className="bg-slate-800 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl sm:text-2xl font-bold hover:text-slate-200 transition-colors">
          HTAgency Academy
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6"> {/* Use flex and gap for multiple nav items */}
          <Link href="/" className="text-slate-50 hover:text-slate-300 transition-colors text-sm sm:text-base">
            Courses
          </Link>
          <Link href="/favorites" className="text-slate-50 hover:text-slate-300 transition-colors text-sm sm:text-base">
            My Favorites {favoriteIds.length > 0 ? `(${favoriteIds.length})` : ''}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
