"use client"; // Required for useState and event handlers

import { useState, useMemo, MouseEvent } from 'react'; // Added MouseEvent
import Link from 'next/link';
import { Course } from '@/types/course';
import { useFavorites } from '@/context/FavoritesContext'; // Import useFavorites
import { Button } from '@/components/ui/button'; // Import Button
import { Heart } from 'lucide-react'; // Import Heart icon
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Mock data
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

const ALL_FILTER_VALUE = "all";

const HomePage = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>(ALL_FILTER_VALUE);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(ALL_FILTER_VALUE);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites(); // Use favorites context

  const topics = useMemo(() => {
    const uniqueTopics = new Set(mockCourses.map(course => course.topic));
    return [ALL_FILTER_VALUE, ...Array.from(uniqueTopics)];
  }, []);

  const difficulties = useMemo(() => {
    const uniqueDifficulties = new Set(mockCourses.map(course => course.difficulty));
    return [ALL_FILTER_VALUE, ...Array.from(uniqueDifficulties)];
  }, []);

  const filteredCourses = useMemo(() => {
    return mockCourses.filter(course => {
      const topicMatch = selectedTopic === ALL_FILTER_VALUE || course.topic === selectedTopic;
      const difficultyMatch = selectedDifficulty === ALL_FILTER_VALUE || course.difficulty === selectedDifficulty;
      return topicMatch && difficultyMatch;
    });
  }, [selectedTopic, selectedDifficulty]);

  const getDifficultyClass = (difficulty: Course['difficulty']) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600';
      case 'Intermediate': return 'text-yellow-600';
      case 'Advanced': return 'text-red-600';
      default: return '';
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center text-slate-800">Our Courses</h1>

      {/* Filter Controls Section */}
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-end">
          <div className="flex-1 sm:flex-grow-0 flex flex-col space-y-1.5 min-w-[180px] sm:min-w-[200px]">
            <Label htmlFor="topic-filter" className="text-sm font-medium text-slate-700">Filter by Topic</Label>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-full" id="topic-filter">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>
                    {topic === ALL_FILTER_VALUE ? "All Topics" : capitalize(topic)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 sm:flex-grow-0 flex flex-col space-y-1.5 min-w-[180px] sm:min-w-[200px]">
            <Label htmlFor="difficulty-filter" className="text-sm font-medium text-slate-700">Filter by Difficulty</Label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full" id="difficulty-filter">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === ALL_FILTER_VALUE ? "All Difficulties" : capitalize(difficulty)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isFav = isFavorite(course.id);
            const handleFavoriteToggle = (e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              e.preventDefault();
              if (isFav) {
                removeFavorite(course.id);
              } else {
                addFavorite(course.id);
              }
            };

            return (
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
        <p className="text-center text-slate-500 py-10">No courses match the selected filters.</p>
      )}
    </div>
  );
};

export default HomePage;
