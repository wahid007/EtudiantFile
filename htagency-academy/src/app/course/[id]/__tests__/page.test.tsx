import { render, screen, waitFor } from '@testing-library/react'; // Added waitFor
import userEvent from '@testing-library/user-event'; // Import userEvent
import '@testing-library/jest-dom';
import CourseDetailPage from '../page';
import { Course } from '@/types/course';
import { FavoritesProvider } from '@/context/FavoritesContext'; // Import FavoritesProvider
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/course/some-id'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));

// Mock localStorage for FavoritesContext
let store: { [key: string]: string } = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    store[key] = value.toString();
  }),
  removeItem: jest.fn((key: string) => { delete store[key]; }),
  clear: jest.fn(() => { store = {}; }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper component to wrap CourseDetailPage with Providers
const renderDetailPageWithProviders = (params: { id: string }) => {
  return render(
    <FavoritesProvider>
      <CourseDetailPage params={params} />
    </FavoritesProvider>
  );
};

// Re-define mockCourses here for test context or import if refactored to a shared location
const mockCoursesForTest: Course[] = [
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
  // Add more if specific tests need them, but one is enough for "found" case.
];

describe('CourseDetailPage', () => {
  beforeEach(() => {
    // Clear localStorage mock and spies before each test in this suite
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Course Found', () => {
    const selectedCourse = mockCoursesForTest[0];

    beforeEach(() => {
      // Render the component with params for the selected course
      renderDetailPageWithProviders({ id: selectedCourse.id });
    });

    test('displays the course name as a main heading', () => {
      expect(screen.getByRole('heading', { name: selectedCourse.name, level: 1 })).toBeInTheDocument();
    });

    // Helper to capitalize (should match the one in the component)
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    test('displays the course topic', () => {
      const expectedTopic = capitalize(selectedCourse.topic);
      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' &&
               element.textContent === expectedTopic &&
               element.classList.contains('text-blue-600'); // Class from the component
      })).toBeInTheDocument();
    });

    test('displays the course difficulty', () => {
      const expectedDifficulty = capitalize(selectedCourse.difficulty);
      // Example class for Beginner: text-green-700 bg-green-100
      // This check will be more robust by checking the text within the specific span.
      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' &&
               element.textContent === expectedDifficulty &&
               element.classList.contains('rounded-full'); // Common class for the difficulty badge
      })).toBeInTheDocument();
    });

    test('displays the course description', () => {
      expect(screen.getByText(selectedCourse.description)).toBeInTheDocument();
    });

    test('displays the course duration', () => {
      expect(screen.getByText(new RegExp(selectedCourse.duration, "i"))).toBeInTheDocument();
    });

    test('displays the course price', () => {
      // Price is formatted as $XX.YY. Check for both parts.
      // Using regex to find elements containing the price.
      // The page renders: <p class="text-2xl font-bold text-blue-600">$49.99</p>
      // So, we can check for text content that includes the dollar sign and the number.
      const priceRegex = new RegExp(`\\$${selectedCourse.price.toFixed(2)}`);
      expect(screen.getByText(priceRegex)).toBeInTheDocument();
    });

    test('displays the "Back to Courses" link with correct href', () => {
      const backLink = screen.getByRole('link', { name: /Back to Courses/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });
  });

  describe('Course Not Found', () => {
    beforeEach(() => {
      renderDetailPageWithProviders({ id: "non_existent_id" });
    });

    test('displays the "Course not found" message', () => {
      expect(screen.getByRole('heading', { name: /Course not found/i, level: 1 })).toBeInTheDocument();
    });

    test('displays the "Back to Courses" link', () => {
      const backLink = screen.getByRole('link', { name: /Back to Courses/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });
  });

  describe('Favorites Functionality on Detail Page', () => {
    const courseToTest = mockCoursesForTest[0]; // Use course_001

    test('toggles favorite status for the displayed course', async () => {
      renderDetailPageWithProviders({ id: courseToTest.id });

      // Find the favorite button (aria-label changes based on state)
      // Initial state: Add to favorites
      const addButton = screen.getByRole('button', { name: /add to favorites/i });
      expect(addButton).toBeInTheDocument();

      // 1. Add to favorites
      await userEvent.click(addButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('htacademy-favorites', JSON.stringify([courseToTest.id]));
      // Button should now be "Remove from favorites"
      // Need waitFor because the state update and re-render might take a moment
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
      });

      // 2. Remove from favorites
      const removeButton = screen.getByRole('button', { name: /remove from favorites/i });
      await userEvent.click(removeButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('htacademy-favorites', JSON.stringify([]));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
      });
    });
  });
});
