import Link from 'next/link';
import { Course } from '@/types/course'; // Assuming Course interface is in src/types/course.ts
// Assuming mockCourses is imported from a file, or defined here for simplicity
// For this example, let's redefine mockCourses here. In a real app, this would be a shared import.

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

interface CourseDetailPageProps {
  params: {
    id: string;
  };
}

// Helper to capitalize
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const CourseDetailPage = ({ params }: CourseDetailPageProps) => {
  const course = mockCourses.find(c => c.id === params.id);

  if (!course) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Course not found</h1>
        <Link href="/" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Back to Courses
        </Link>
      </div>
    );
  }

  const getDifficultyClass = (difficulty: Course['difficulty']) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-700 bg-green-100';
      case 'Intermediate': return 'text-yellow-700 bg-yellow-100';
      case 'Advanced': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-slate-200">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">{course.name}</h1>

        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <span className="font-semibold text-slate-700">Topic:</span>
          <span className="text-blue-600 font-medium">{capitalize(course.topic)}</span>
          <span className="font-semibold text-slate-700">Difficulty:</span>
          <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyClass(course.difficulty)}`}>
            {capitalize(course.difficulty)}
          </span>
        </div>

        <div className="prose max-w-none text-slate-700 mb-6">
          <p>{course.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Duration</h2>
            <p>{course.duration}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Price</h2>
            <p className="text-2xl font-bold text-blue-600">${course.price.toFixed(2)}</p>
          </div>
        </div>

      </div>

      <div className="text-center mt-8">
        <Link href="/" className="inline-block bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
          Back to Courses
        </Link>
      </div>
    </div>
  );
};

export default CourseDetailPage;
