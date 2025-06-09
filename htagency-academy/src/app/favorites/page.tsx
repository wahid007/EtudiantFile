"use client";

import Link from 'next/link';
import { Course } from '@/types/course';
import { useFavorites } from '@/context/FavoritesContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MouseEvent } from 'react'; // For MouseEvent type on handler

// Mock data (ideally from a shared source)
const mockCourses: Course[] = [
  {
    "id": "course_001",
    "name": "Introduction to Web Development",
    "description": "Learn the fundamentals of web development, including HTML, CSS, and JavaScript.",
    "duration": "8 weeks",
    "price": 49.99,
    "topic": "Web Development",
    "difficulty": "Beginner"
  },
  {
    "id": "course_002",
    "name": "Advanced JavaScript Concepts",
    "description": "Dive deep into advanced JavaScript topics like closures, promises, and async/await.",
    "duration": "6 weeks",
    "price": 79.99,
    "topic": "Web Development",
    "difficulty": "Intermediate"
  },
  {
    "id": "course_003",
    "name": "Python for Data Science",
    "description": "Explore how to use Python for data analysis, visualization, and machine learning.",
    "duration": "10 weeks",
    "price": 99.99,
    "topic": "Data Science",
    "difficulty": "Intermediate"
  },
  {
    "id": "course_004",
    "name": "Cybersecurity Essentials",
    "description": "Understand the basics of cybersecurity, common threats, and defensive measures.",
    "duration": "4 weeks",
    "price": 69.99,
    "topic": "Cybersecurity",
    "difficulty": "Beginner"
  },
  {
    "id": "course_005",
    "name": "Mastering React and Next.js",
    "description": "Build powerful server-rendered web applications with React and Next.js.",
    "duration": "12 weeks",
    "price": 129.99,
    "topic": "Web Development",
    "difficulty": "Advanced"
  }
];

// Helper to capitalize
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Helper for difficulty class (consistent with main page)
const getDifficultyClass = (difficulty: Course['difficulty']) => {
  switch (difficulty) {
    case 'Beginner': return 'text-green-600';
    case 'Intermediate': return 'text-yellow-600';
    case 'Advanced': return 'text-red-600';
    default: return '';
  }
};


const FavoritesPage = () => {
  const { favoriteIds, addFavorite, removeFavorite, isFavorite } = useFavorites();

  const favoriteCourses = mockCourses.filter(course => favoriteIds.includes(course.id));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center text-slate-800">My Favorite Courses</h1>

      {favoriteCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteCourses.map((course) => {
            const isFav = isFavorite(course.id); // Will always be true here unless state changes mid-render

            const handleFavoriteToggle = (e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              e.preventDefault();
              if (isFav) {
                removeFavorite(course.id);
              } else {
                // This case might not be strictly needed if only favs are shown,
                // but good for robustness if card component is reused.
                addFavorite(course.id);
              }
            };

            return (
              // Each card is a link to its detail page
              <Link key={course.id} href={`/course/${course.id}`} className="flex">
                <Card data-testid="course-card" className="flex flex-col w-full bg-white hover:shadow-lg transition-shadow duration-200 rounded-xl border border-slate-200">
                  <CardHeader className="pb-4 relative">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg sm:text-xl text-slate-800 mr-2">{course.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleFavoriteToggle}
                        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                        className="h-8 w-8 shrink-0"
                      >
                        <Heart
                          className={`h-5 w-5 ${isFav ? 'text-red-500' : 'text-slate-400'}`}
                          fill={isFav ? "currentColor" : "none"}
                        />
                      </Button>
                    </div>
                    <CardDescription className="text-sm text-slate-600 pt-1">
                      {capitalize(course.topic)} - <span className={`font-medium ${getDifficultyClass(course.difficulty)}`}>
                        {capitalize(course.difficulty)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow text-slate-700 text-sm">
                    <p>{course.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center mt-auto pt-4 border-t border-slate-200 text-sm text-slate-600">
                    <span>Duration: {course.duration}</span>
                    <span className="text-lg font-semibold text-blue-600">${course.price.toFixed(2)}</span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-10">
          <p className="mb-4">You haven't added any courses to your favorites yet.</p>
          <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
