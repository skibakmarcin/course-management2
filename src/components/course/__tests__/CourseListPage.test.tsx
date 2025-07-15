import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { CourseListPage } from '../CourseListPage';
import { CourseProvider } from '../../../store/CourseContext';

// Mock the course API
jest.mock('../../../services/courseApi', () => ({
  getCourses: jest.fn(),
  createCourse: jest.fn(),
  updateCourse: jest.fn(),
  deleteCourse: jest.fn(),
}));

// Mock the utility functions
jest.mock('../../../utils/formatDuration', () => ({
  formatDuration: jest.fn((minutes) => `${minutes} min`),
}));

jest.mock('../../../utils/formatDate', () => ({
  formatDate: jest.fn((date) => 'Jan 1, 2024'),
}));

// Mock the UI components
jest.mock('../../ui/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => <div data-testid={`status-${status}`}>{status}</div>,
}));

jest.mock('../../ui/DraggableCourseList', () => ({
  DraggableCourseList: ({ courses }: { courses: any[] }) => (
    <div data-testid="draggable-list">
      {courses.map(course => (
        <div key={course.id} data-testid={`draggable-course-${course.id}`}>
          {course.title}
        </div>
      ))}
    </div>
  ),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    <BrowserRouter>
      <CourseProvider>
        {children}
      </CourseProvider>
    </BrowserRouter>
  </ChakraProvider>
);

// Mock course data
const mockCourses = [
  {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn the basics of React',
    duration: 120,
    status: 'draft',
    createdAt: '2024-01-01T00:00:00Z',
    publishedAt: null,
  },
  {
    id: '2',
    title: 'Advanced TypeScript',
    description: 'Master TypeScript for better development',
    duration: 180,
    status: 'published',
    createdAt: '2024-01-02T00:00:00Z',
    publishedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '3',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications',
    duration: 240,
    status: 'archived',
    createdAt: '2024-01-04T00:00:00Z',
    publishedAt: '2024-01-05T00:00:00Z',
  },
];

describe('CourseListPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Critical User Flows', () => {
    test('should display courses in grid view by default', async () => {
      // Mock the API to return courses
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      // Wait for courses to load
      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Node.js Backend Development')).toBeInTheDocument();
      });

      // Check that status badges are displayed
      expect(screen.getByTestId('status-draft')).toBeInTheDocument();
      expect(screen.getByTestId('status-published')).toBeInTheDocument();
      expect(screen.getByTestId('status-archived')).toBeInTheDocument();
    });

    test('should filter courses by status', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Open status filter dropdown
      const statusFilter = screen.getByDisplayValue('All Statuses');
      fireEvent.change(statusFilter, { target: { value: 'draft' } });

      // Check that only draft courses are shown
      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        expect(screen.queryByText('Advanced TypeScript')).not.toBeInTheDocument();
        expect(screen.queryByText('Node.js Backend Development')).not.toBeInTheDocument();
      });
    });

    test('should search courses by title', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Search for "React"
      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'React' } });

      // Check that only React course is shown
      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        expect(screen.queryByText('Advanced TypeScript')).not.toBeInTheDocument();
        expect(screen.queryByText('Node.js Backend Development')).not.toBeInTheDocument();
      });
    });

    test('should switch between grid, list, and drag views', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Switch to list view
      const listViewButton = screen.getByLabelText('List view');
      fireEvent.click(listViewButton);

      // Check that we're in list view (courses should still be visible)
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();

      // Switch to drag view
      const dragViewButton = screen.getByLabelText('Drag & drop view');
      fireEvent.click(dragViewButton);

      // Check that draggable list is shown
      await waitFor(() => {
        expect(screen.getByTestId('draggable-list')).toBeInTheDocument();
        expect(screen.getByTestId('draggable-course-1')).toBeInTheDocument();
      });

      // Switch back to grid view
      const gridViewButton = screen.getByLabelText('Grid view');
      fireEvent.click(gridViewButton);

      // Check that we're back to grid view
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });

    test('should show advanced filters when toggled', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Click on Advanced Filters button
      const advancedFiltersButton = screen.getByText('Advanced Filters');
      fireEvent.click(advancedFiltersButton);

      // Check that advanced filter inputs are shown
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Min Duration (min)')).toBeInTheDocument();
      expect(screen.getByLabelText('Max Duration (min)')).toBeInTheDocument();
    });

    test('should filter by date range', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Open advanced filters
      const advancedFiltersButton = screen.getByText('Advanced Filters');
      fireEvent.click(advancedFiltersButton);

      // Set start date
      const startDateInput = screen.getByLabelText('Start Date');
      fireEvent.change(startDateInput, { target: { value: '2024-01-02' } });

      // Check that only courses created after Jan 2 are shown
      await waitFor(() => {
        expect(screen.queryByText('React Fundamentals')).not.toBeInTheDocument();
        expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Node.js Backend Development')).toBeInTheDocument();
      });
    });

    test('should filter by duration range', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Open advanced filters
      const advancedFiltersButton = screen.getByText('Advanced Filters');
      fireEvent.click(advancedFiltersButton);

      // Set max duration to 150 minutes
      const maxDurationInput = screen.getByLabelText('Max Duration (min)');
      fireEvent.change(maxDurationInput, { target: { value: '150' } });

      // Check that only courses with duration <= 150 are shown
      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        expect(screen.queryByText('Advanced TypeScript')).not.toBeInTheDocument();
        expect(screen.queryByText('Node.js Backend Development')).not.toBeInTheDocument();
      });
    });

    test('should sort courses by different criteria', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Change sort by to title
      const sortBySelect = screen.getByDisplayValue('Created Date');
      fireEvent.change(sortBySelect, { target: { value: 'title' } });

      // Change sort order to ascending
      const sortOrderSelect = screen.getByDisplayValue('↓ Descending');
      fireEvent.change(sortOrderSelect, { target: { value: 'asc' } });

      // The courses should be sorted alphabetically (Advanced TypeScript should come first)
      await waitFor(() => {
        const courseElements = screen.getAllByText(/React Fundamentals|Advanced TypeScript|Node\.js Backend Development/);
        expect(courseElements[0]).toHaveTextContent('Advanced TypeScript');
      });
    });

    test('should show empty state when no courses match filters', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Search for non-existent course
      const searchInput = screen.getByPlaceholderText('Search courses...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentCourse' } });

      // Check that empty state is shown
      await waitFor(() => {
        expect(screen.getByText('No courses found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your filters or create a new course')).toBeInTheDocument();
      });
    });

    test('should show loading state while fetching courses', () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      // Check that loading spinner is shown
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('should show error state when API fails', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockRejectedValue(new Error('Failed to fetch courses'));

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      // Check that error message is shown
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch courses')).toBeInTheDocument();
      });
    });

    test('should navigate to create course page', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      const mockNavigate = jest.fn();
      jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Click create course button
      const createButton = screen.getByText('+ Create Course');
      fireEvent.click(createButton);

      // Check that navigation was called
      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });

    test('should navigate to edit course page', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      const mockNavigate = jest.fn();
      jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Click edit button for the first course
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Check that navigation was called with correct course ID
      expect(mockNavigate).toHaveBeenCalledWith('/edit/1');
    });
  });

  describe('Course Management Actions', () => {
    test('should publish a draft course', async () => {
      const { getCourses, updateCourse } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);
      updateCourse.mockResolvedValue({});

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Click publish button for draft course
      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);

      // Check that update API was called
      await waitFor(() => {
        expect(updateCourse).toHaveBeenCalledWith('1', { status: 'published' });
      });
    });

    test('should archive a published course', async () => {
      const { getCourses, updateCourse } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);
      updateCourse.mockResolvedValue({});

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
      });

      // Click archive button for published course
      const archiveButton = screen.getByText('Archive');
      fireEvent.click(archiveButton);

      // Check that update API was called
      await waitFor(() => {
        expect(updateCourse).toHaveBeenCalledWith('2', { status: 'archived' });
      });
    });

    test('should delete a course', async () => {
      const { getCourses, deleteCourse } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);
      deleteCourse.mockResolvedValue({});

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Click delete button for the first course
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      // Check that delete API was called
      await waitFor(() => {
        expect(deleteCourse).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels for view toggle buttons', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Check that view toggle buttons have proper ARIA labels
      expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
      expect(screen.getByLabelText('List view')).toBeInTheDocument();
      expect(screen.getByLabelText('Drag & drop view')).toBeInTheDocument();
    });

    test('should have proper form labels for filters', async () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue(mockCourses);

      render(
        <TestWrapper>
          <CourseListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      });

      // Check that filter inputs have proper labels
      expect(screen.getByPlaceholderText('Search courses...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Statuses')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Created Date')).toBeInTheDocument();
    });
  });
}); 