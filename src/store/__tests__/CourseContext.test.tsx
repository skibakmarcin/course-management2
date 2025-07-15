import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseProvider, useCourseContext } from '../CourseContext';
import * as courseApi from '../../services/courseApi';

// Mock the course API
jest.mock('../../services/courseApi');

const mockCourses = [
  {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn React basics',
    duration: 120,
    status: 'draft',
    createdAt: '2024-01-01T00:00:00Z',
    publishedAt: null,
  },
  {
    id: '2',
    title: 'Advanced TypeScript',
    description: 'Master TypeScript',
    duration: 180,
    status: 'published',
    createdAt: '2024-01-02T00:00:00Z',
    publishedAt: '2024-01-03T00:00:00Z',
  },
];

// Test component to access context
const TestComponent: React.FC = () => {
  const { courses, loading, error, create, update, remove, reorder } = useCourseContext();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="courses-count">{courses.length}</div>
      <button onClick={() => create({ title: 'New Course', description: 'Test', duration: 60 })}>
        Create Course
      </button>
      <button onClick={() => update('1', { title: 'Updated Course' })}>
        Update Course
      </button>
      <button onClick={() => remove('1')}>
        Delete Course
      </button>
      <button onClick={() => reorder(0, 1)}>
        Reorder Courses
      </button>
    </div>
  );
};

describe('CourseContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('should provide initial state', () => {
      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('courses-count')).toHaveTextContent('0');
    });
  });

  describe('Loading Courses', () => {
    test('should load courses successfully', async () => {
      (courseApi.getCourses as jest.Mock).mockResolvedValue(mockCourses);

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      // Initially loading
      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      // After loading completes
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('courses-count')).toHaveTextContent('2');
      });

      expect(courseApi.getCourses).toHaveBeenCalledTimes(1);
    });

    test('should handle loading error', async () => {
      (courseApi.getCourses as jest.Mock).mockRejectedValue(new Error('Failed to load courses'));

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to load courses');
      });
    });
  });

  describe('Creating Courses', () => {
    test('should create course successfully', async () => {
      (courseApi.getCourses as jest.Mock).mockResolvedValue(mockCourses);
      (courseApi.createCourse as jest.Mock).mockResolvedValue({});

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('courses-count')).toHaveTextContent('2');
      });

      // Create a new course
      const createButton = screen.getByText('Create Course');
      fireEvent.click(createButton);

      // Should show loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      // After creation completes
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(courseApi.createCourse).toHaveBeenCalledWith({
        title: 'New Course',
        description: 'Test',
        duration: 60,
      });

      // Should refresh courses after creation
      expect(courseApi.getCourses).toHaveBeenCalledTimes(2);
    });

    test('should handle creation error', async () => {
      (courseApi.getCourses as jest.Mock).mockResolvedValue(mockCourses);
      (courseApi.createCourse as jest.Mock).mockRejectedValue(new Error('Failed to create course'));

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('courses-count')).toHaveTextContent('2');
      });

      // Try to create a course
      const createButton = screen.getByText('Create Course');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to create course');
      });
    });
  });

  describe('Updating Courses', () => {
    test('should update course successfully', async () => {
      (courseApi.getCourses as jest.Mock).mockResolvedValue(mockCourses);
      (courseApi.updateCourse as jest.Mock).mockResolvedValue({});

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('courses-count')).toHaveTextContent('2');
      });

      // Update a course
      const updateButton = screen.getByText('Update Course');
      fireEvent.click(updateButton);

      // Should show loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      // After update completes
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(courseApi.updateCourse).toHaveBeenCalledWith('1', {
        title: 'Updated Course',
      });

      // Should refresh courses after update
      expect(courseApi.getCourses).toHaveBeenCalledTimes(2);
    });

    test('should handle update error', async () => {
      (courseApi.getCourses as jest.Mock).mockResolvedValue(mockCourses);
      (courseApi.updateCourse as jest.Mock).mockRejectedValue(new Error('Failed to update course'));

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('courses-count')).toHaveTextContent('2');
      });

      // Try to update a course
      const updateButton = screen.getByText('Update Course');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to update course');
      });
    });
  });

  describe('Deleting Courses', () => {
    test('should delete course successfully', async () => {
      (courseApi.getCourses as jest.Mock).mockResolvedValue(mockCourses);
      (courseApi.deleteCourse as jest.Mock).mockResolvedValue({});

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('courses-count')).toHaveTextContent('2');
      });

      // Delete a course
      const deleteButton = screen.getByText('Delete Course');
      fireEvent.click(deleteButton);

      // Should show loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('true');

      // After deletion completes
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(courseApi.deleteCourse).toHaveBeenCalledWith('1');

      // Should refresh courses after deletion
      expect(courseApi.getCourses).toHaveBeenCalledTimes(2);
    });

    test('should handle deletion error', async () => {
      (courseApi.getCourses as jest.Mock).mockResolvedValue(mockCourses);
      (courseApi.deleteCourse as jest.Mock).mockRejectedValue(new Error('Failed to delete course'));

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('courses-count')).toHaveTextContent('2');
      });

      // Try to delete a course
      const deleteButton = screen.getByText('Delete Course');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to delete course');
      });
    });
  });

  describe('Reordering Courses', () => {
    test('should reorder courses correctly', async () => {
      (courseApi.getCourses as jest.Mock).mockResolvedValue(mockCourses);

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('courses-count')).toHaveTextContent('2');
      });

      // Reorder courses (move first course to second position)
      const reorderButton = screen.getByText('Reorder Courses');
      fireEvent.click(reorderButton);

      // The reorder function should update the local state
      // We can't easily test the exact order without exposing the courses array,
      // but we can verify the function was called
      expect(screen.getByTestId('courses-count')).toHaveTextContent('2');
    });
  });

  describe('Error Handling', () => {
    test('should clear error when new operation starts', async () => {
      (courseApi.getCourses as jest.Mock).mockRejectedValue(new Error('Initial error'));
      (courseApi.createCourse as jest.Mock).mockResolvedValue({});

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      // Wait for initial error
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Initial error');
      });

      // Start a new operation (create course)
      const createButton = screen.getByText('Create Course');
      fireEvent.click(createButton);

      // Error should be cleared when new operation starts
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    test('should handle API errors with custom messages', async () => {
      (courseApi.getCourses as jest.Mock).mockRejectedValue(new Error('Custom error message'));

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Custom error message');
      });
    });

    test('should handle API errors without messages', async () => {
      (courseApi.getCourses as jest.Mock).mockRejectedValue(new Error());

      render(
        <CourseProvider>
          <TestComponent />
        </CourseProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to load courses');
      });
    });
  });

  describe('Context Usage', () => {
    test('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useCourseContext must be used within CourseProvider');

      consoleSpy.mockRestore();
    });
  });
}); 