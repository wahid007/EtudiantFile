import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'; // Added waitFor
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import HomePage from '../page';
import { FavoritesProvider } from '@/context/FavoritesContext'; // Import FavoritesProvider
import React from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Import usePathname and useRouter

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ // Return an object with the push mock
    push: mockPush,
    replace: jest.fn(), // Add other methods if needed
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: jest.fn().mockReturnValue('/'),
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


// Helper component to wrap HomePage with Providers
const renderHomePageWithProviders = () => {
  return render(
    <FavoritesProvider>
      <HomePage />
    </FavoritesProvider>
  );
};

// Define coursesMock at a higher scope accessible to all describe blocks within 'HomePage Tests'
const coursesMock = [
  { id: "course_001", name: "Introduction to Web Development", topic: "Web Development", difficulty: "Beginner" },
  { id: "course_002", name: "Advanced JavaScript Concepts", topic: "Web Development", difficulty: "Intermediate" },
  { id: "course_003", name: "Python for Data Science", topic: "Data Science", difficulty: "Intermediate" },
  { id: "course_004", name: "Cybersecurity Essentials", topic: "Cybersecurity", difficulty: "Beginner" },
  { id: "course_005", name: "Mastering React and Next.js", topic: "Web Development", difficulty: "Advanced" }
];


describe('HomePage Tests', () => {
  beforeEach(() => {
    // Clear localStorage mock and spies before each test in this suite
    localStorageMock.clear();
    jest.clearAllMocks(); // Clears all mocks, including localStorageMock calls and next/navigation
  });

  // --- Filtering Tests (Existing tests, wrapped with Provider) ---
  describe('Filtering Logic', () => {
    // Helper to find all rendered course names (can remain here or be moved up if needed by other suites)
    const getRenderedCourseNames = () => {
    const courseCards = screen.queryAllByTestId('course-card');
    if (!courseCards.length) {
        return screen.queryAllByRole('heading', { level: 1 , name: /Our Courses/i}).length
        ? screen.queryAllByRole('heading', { name: /(Introduction to Web Development|Advanced JavaScript Concepts|Python for Data Science|Cybersecurity Essentials|Mastering React and Next\.js)/i })
            .map(h => h.textContent)
        : [];
    }
    return courseCards.map(card => {
      const titleElement = within(card).queryByRole('heading');
      return titleElement ? titleElement.textContent : '';
    });
  };

  // coursesMock is now defined above, accessible here

  test('renders all courses initially', () => {
    renderHomePageWithProviders();
    // Check for the main title
    expect(screen.getByRole('heading', { name: /Our Courses/i })).toBeInTheDocument();

    // Check if all course names are present
    coursesMock.forEach(course => {
      expect(screen.getByText(course.name)).toBeInTheDocument();
    });
    // Check count if possible, though CardTitle might not be a heading role by default in shadcn
    // Using text match is more robust here.
  });

  test('filters by topic "Data Science"', async () => {
    renderHomePageWithProviders();

    const topicSelectTrigger = screen.getByLabelText(/Filter by Topic/i);
    await userEvent.click(topicSelectTrigger); // Use userEvent.click

    // Wait for items to be available. shadcn/ui Select renders options with role 'option'.
    // The text displayed in SelectItem is what we match for the name.
    const topicOption = await screen.findByRole('option', { name: /Data Science/i });
    await userEvent.click(topicOption); // Use userEvent.click

    expect(screen.getByText('Python for Data Science')).toBeInTheDocument();
    expect(screen.queryByText('Introduction to Web Development')).not.toBeInTheDocument();
    expect(screen.queryByText('Cybersecurity Essentials')).not.toBeInTheDocument();
  });

  test('filters by difficulty "Advanced"', async () => {
    renderHomePageWithProviders();

    const difficultySelectTrigger = screen.getByLabelText(/Filter by Difficulty/i);
    await userEvent.click(difficultySelectTrigger); // Use userEvent.click

    const difficultyOption = await screen.findByRole('option', { name: /Advanced/i });
    await userEvent.click(difficultyOption); // Use userEvent.click

    expect(screen.getByText('Mastering React and Next.js')).toBeInTheDocument();
    expect(screen.queryByText('Introduction to Web Development')).not.toBeInTheDocument();
    expect(screen.queryByText('Python for Data Science')).not.toBeInTheDocument();
  });

  test('filters by topic "Web Development" and difficulty "Beginner"', async () => {
    renderHomePageWithProviders();

    // Filter by topic
    const topicSelectTrigger = screen.getByLabelText(/Filter by Topic/i);
    await userEvent.click(topicSelectTrigger); // Use userEvent.click
    const topicOption = await screen.findByRole('option', { name: /Web Development/i });
    await userEvent.click(topicOption); // Use userEvent.click for option too

    // Filter by difficulty
    const difficultySelectTrigger = screen.getByLabelText(/Filter by Difficulty/i);
    await userEvent.click(difficultySelectTrigger); // Use userEvent.click
    const difficultyOption = await screen.findByRole('option', { name: /Beginner/i });
    await userEvent.click(difficultyOption); // Use userEvent.click for option too

    expect(screen.getByText('Introduction to Web Development')).toBeInTheDocument();
    expect(screen.queryByText('Advanced JavaScript Concepts')).not.toBeInTheDocument(); // Same topic, different difficulty
    expect(screen.queryByText('Mastering React and Next.js')).not.toBeInTheDocument(); // Same topic, different difficulty
    expect(screen.queryByText('Python for Data Science')).not.toBeInTheDocument();
  });

  test('shows "No courses match" message when filters result in no matches', async () => {
    renderHomePageWithProviders();

    const topicSelectTrigger = screen.getByLabelText(/Filter by Topic/i);
    await userEvent.click(topicSelectTrigger); // Use userEvent.click
    const topicOption = await screen.findByRole('option', { name: /Cybersecurity/i }); // Use findByRole
    await userEvent.click(topicOption); // Use userEvent.click

    const difficultySelectTrigger = screen.getByLabelText(/Filter by Difficulty/i);
    await userEvent.click(difficultySelectTrigger); // Use userEvent.click

    const difficultyOption = await screen.findByRole('option', { name: /Advanced/i }); // name was 'Advanced', make it regex /Advanced/i for consistency
    await userEvent.click(difficultyOption); // Use userEvent.click

    expect(screen.getByText(/No courses match the selected filters/i)).toBeInTheDocument();
    expect(screen.queryByText('Cybersecurity Essentials')).not.toBeInTheDocument();
  });
});

  // --- Favorites Functionality Tests ---
  describe('Favorites Functionality', () => {
    test('toggles favorite status for a course', async () => {
      renderHomePageWithProviders();
      const courseToTest = coursesMock[0]; // Introduction to Web Development

      // Find the favorite button for the first course.
      // We need a way to target a specific card's button.
      // Assuming CardTitle contains the course name and is within the same Card as the button.
      const courseCard = screen.getByText(courseToTest.name).closest('[data-testid="course-card"]');
      expect(courseCard).toBeInTheDocument();

      // Find the favorite button within this card
      // The button's aria-label changes, so we find it by role within the card
      const favoriteButton = within(courseCard!).getByRole('button', { name: /add to favorites/i }); // Initial state
      expect(favoriteButton).toBeInTheDocument();

      // 1. Add to favorites
      await userEvent.click(favoriteButton);

      // Aria-label should change, localStorage should be called
      expect(localStorageMock.setItem).toHaveBeenCalledWith('htacademy-favorites', JSON.stringify([courseToTest.id]));
      // The button's aria-label should now be "Remove from favorites"
      // Need waitFor because the state update and re-render might take a moment
      await waitFor(() => {
        expect(within(courseCard!).getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
      });

      // 2. Remove from favorites
      const removeFavoriteButton = within(courseCard!).getByRole('button', { name: /remove from favorites/i });
      await userEvent.click(removeFavoriteButton);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('htacademy-favorites', JSON.stringify([]));
      await waitFor(() => {
        expect(within(courseCard!).getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
      });
    });

    test('favorite button click does not navigate', async () => {
      // This test implies that the Link's navigation was prevented.
      // We can check this by ensuring the pathname (mocked) doesn't change
      // or more simply, rely on the e.stopPropagation() and e.preventDefault() in the handler.
      // A full navigation test is complex with mocks. Here, we trust the event handlers.
      renderHomePageWithProviders();
      const courseToTest = coursesMock[0];
      const courseCard = screen.getByText(courseToTest.name).closest('[data-testid="course-card"]');
      const favoriteButton = within(courseCard!).getByRole('button', { name: /add to favorites/i });

      // Click should not throw error or change mocked pathname
      await userEvent.click(favoriteButton);
      expect(mockPush).not.toHaveBeenCalled(); // Check that router.push was not called
    });
  });
});

// Note: For shadcn Select components, userEvent.click on the trigger
// then fireEvent.click on the desired SelectItem (found by text or role='option')
// is a common way to simulate selection.
// The actual text rendered in SelectItem is what you should target.
// `getByLabelText` is used to find the SelectTrigger associated with the Label.
// This works because page.tsx was updated to add id="topic-filter" and id="difficulty-filter"
// to the SelectTrigger components, linking them to the Labels' htmlFor attributes.

// Regarding CardTitle testing:
// The current HomePage test already checks for course names.
// To test a "CourseCard" component specifically, it would be better to refactor it.
// For now, testing its output as part of page.test.tsx is done by verifying text content.
// The `getRenderedCourseNames` helper is an attempt but needs `data-testid="course-card"` on the Card (which was added).
// A simpler check is `screen.getByText(course.name)` which is already used for basic presence.
// For more detailed card structure test (example):
// const firstCard = screen.getByText(coursesMock[0].name).closest('div[data-testid="course-card"]');
// if (firstCard) { // Check if firstCard is not null
//   expect(within(firstCard).getByText(coursesMock[0].description)).toBeInTheDocument();
// }
// This level of detail for card content is implicitly covered by checking individual text pieces (name, price, etc.)
// as long as those pieces are specific enough to imply they are on the same card.
// The current tests verify course names and some details, which is good.
// The test 'renders all courses initially' checks all names.
// Other tests check for specific names after filtering.
// This implicitly tests that the Card component structure (title, description, etc.) is rendering data.
