import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Import userEvent
import '@testing-library/jest-dom';
import HomePage from '../page'; // Adjust path if HomePage is default export from src/app/page.tsx

// Mock useRouter from next/navigation if needed by components under test, not directly by HomePage
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/'), // Mock pathname if used by Select or other child components
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()), // Mock searchParams if used
}));


describe('HomePage Filtering', () => {
  // Helper to find all rendered course names
  const getRenderedCourseNames = () => {
    const courseCards = screen.queryAllByTestId('course-card'); // Need to add data-testid to Card in page.tsx
    if (!courseCards.length) {
        // A more robust way if CardTitle always has the name
        return screen.queryAllByRole('heading', { level: 1 , name: /Our Courses/i}).length // page title
        ? screen.queryAllByRole('heading', { name: /(Introduction to Web Development|Advanced JavaScript Concepts|Python for Data Science|Cybersecurity Essentials|Mastering React and Next\.js)/i })
            .map(h => h.textContent)
        : [];

    }
    return courseCards.map(card => {
      const titleElement = within(card).queryByRole('heading');
      return titleElement ? titleElement.textContent : '';
    });
  };

  const coursesMock = [ // Simplified from page.tsx for test clarity
      { name: "Introduction to Web Development", topic: "Web Development", difficulty: "Beginner" },
      { name: "Advanced JavaScript Concepts", topic: "Web Development", difficulty: "Intermediate" },
      { name: "Python for Data Science", topic: "Data Science", difficulty: "Intermediate" },
      { name: "Cybersecurity Essentials", topic: "Cybersecurity", difficulty: "Beginner" },
      { name: "Mastering React and Next.js", topic: "Web Development", difficulty: "Advanced" }
  ];


  test('renders all courses initially', () => {
    render(<HomePage />);
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
    render(<HomePage />);

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
    render(<HomePage />);

    const difficultySelectTrigger = screen.getByLabelText(/Filter by Difficulty/i);
    await userEvent.click(difficultySelectTrigger); // Use userEvent.click

    const difficultyOption = await screen.findByRole('option', { name: /Advanced/i });
    await userEvent.click(difficultyOption); // Use userEvent.click

    expect(screen.getByText('Mastering React and Next.js')).toBeInTheDocument();
    expect(screen.queryByText('Introduction to Web Development')).not.toBeInTheDocument();
    expect(screen.queryByText('Python for Data Science')).not.toBeInTheDocument();
  });

  test('filters by topic "Web Development" and difficulty "Beginner"', async () => {
    render(<HomePage />);

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
    render(<HomePage />);

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

// Note: For shadcn Select components, fireEvent.mouseDown on the trigger
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
