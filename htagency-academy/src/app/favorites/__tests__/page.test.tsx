import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import FavoritesPage from '../page'; // Assumes default export
import { FavoritesProvider } from '@/context/FavoritesContext';
import { Course } from '@/types/course';
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/favorites'),
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

// Re-define mockCourses (or import from a shared location)
const mockCoursesForTest: Course[] = [
  {
    "id": "course_001",
    "name": "Introduction to Web Development",
    "description": "Desc 1", "duration": "8 weeks", "price": 49.99,
    "topic": "Web Development", "difficulty": "Beginner"
  },
  {
    "id": "course_002",
    "name": "Advanced JavaScript Concepts",
    "description": "Desc 2", "duration": "6 weeks", "price": 79.99,
    "topic": "Web Development", "difficulty": "Intermediate"
  },
  {
    "id": "course_003",
    "name": "Python for Data Science",
    "description": "Desc 3", "duration": "10 weeks", "price": 99.99,
    "topic": "Data Science", "difficulty": "Intermediate"
  }
];

// Helper to render FavoritesPage with provider
const renderFavoritesPage = () => {
  return render(
    <FavoritesProvider>
      <FavoritesPage />
    </FavoritesProvider>
  );
};


describe('FavoritesPage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks(); // Clears all mocks, including localStorageMock calls and next/navigation
    // Reset mockCourses in FavoritesPage if it's internally defined and not passed as prop
    // This is tricky as the page itself re-defines mockCourses.
    // The tests will use mockCoursesForTest for assertions.
  });

  test('displays empty state message when no favorites are added', () => {
    renderFavoritesPage();
    expect(screen.getByRole('heading', { name: /My Favorite Courses/i })).toBeInTheDocument();
    expect(screen.getByText(/You haven't added any courses to your favorites yet./i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse Courses/i })).toHaveAttribute('href', '/');
  });

  test('displays only favorited courses', () => {
    // Pre-populate localStorage with some favorites
    const initialFavorites = ['course_001', 'course_003'];
    localStorageMock.setItem('htacademy-favorites', JSON.stringify(initialFavorites));

    renderFavoritesPage();

    expect(screen.getByRole('heading', { name: /My Favorite Courses/i })).toBeInTheDocument();

    // Check that favorited courses are displayed
    expect(screen.getByText(mockCoursesForTest[0].name)).toBeInTheDocument(); // course_001
    expect(screen.getByText(mockCoursesForTest[2].name)).toBeInTheDocument(); // course_003

    // Check that non-favorited course is NOT displayed
    expect(screen.queryByText(mockCoursesForTest[1].name)).not.toBeInTheDocument(); // course_002
  });

  test('favorite buttons on cards are in "favorited" state (Remove from favorites)', () => {
    localStorageMock.setItem('htacademy-favorites', JSON.stringify(['course_001']));
    renderFavoritesPage();

    const courseCard = screen.getByText(mockCoursesForTest[0].name).closest('[data-testid="course-card"]');
    expect(courseCard).toBeInTheDocument();

    const removeButton = within(courseCard!).getByRole('button', { name: /remove from favorites/i });
    expect(removeButton).toBeInTheDocument();
  });

  test('can remove a course from favorites on the favorites page', async () => {
    localStorageMock.setItem('htacademy-favorites', JSON.stringify(['course_001', 'course_002']));
    renderFavoritesPage();

    // Initially, both courses should be there
    expect(screen.getByText(mockCoursesForTest[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockCoursesForTest[1].name)).toBeInTheDocument();

    // Find the card for course_001 and its remove button
    const courseCard1 = screen.getByText(mockCoursesForTest[0].name).closest('[data-testid="course-card"]');
    const removeButton1 = within(courseCard1!).getByRole('button', { name: /remove from favorites/i });

    await userEvent.click(removeButton1);

    // Check localStorage and UI update
    expect(localStorageMock.setItem).toHaveBeenCalledWith('htacademy-favorites', JSON.stringify(['course_002']));

    // Course_001 should be gone, course_002 should remain
    // Need waitFor for the re-render to complete
    await waitFor(() => {
      expect(screen.queryByText(mockCoursesForTest[0].name)).not.toBeInTheDocument();
    });
    expect(screen.getByText(mockCoursesForTest[1].name)).toBeInTheDocument();
  });

  test('shows empty state message after removing the last favorite item', async () => {
    localStorageMock.setItem('htacademy-favorites', JSON.stringify(['course_001']));
    renderFavoritesPage();

    expect(screen.getByText(mockCoursesForTest[0].name)).toBeInTheDocument();

    const courseCard1 = screen.getByText(mockCoursesForTest[0].name).closest('[data-testid="course-card"]');
    const removeButton1 = within(courseCard1!).getByRole('button', { name: /remove from favorites/i });

    await userEvent.click(removeButton1);

    await waitFor(() => {
      expect(screen.getByText(/You haven't added any courses to your favorites yet./i)).toBeInTheDocument();
    });
    expect(screen.queryByText(mockCoursesForTest[0].name)).not.toBeInTheDocument();
  });
});
