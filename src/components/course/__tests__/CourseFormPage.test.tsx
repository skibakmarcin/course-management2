import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { CourseFormPage } from '../CourseFormPage';
import { CourseProvider } from '../../../store/CourseContext';

// Mock the course API
jest.mock('../../../services/courseApi', () => ({
  getCourses: jest.fn(),
  createCourse: jest.fn(),
  updateCourse: jest.fn(),
  deleteCourse: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: undefined }), // Default to create mode
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

describe('CourseFormPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('Create Course Flow', () => {
    test('should render create course form with empty fields', () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      expect(screen.getByText('Create New Course')).toBeInTheDocument();
      expect(screen.getByText('Add a new course to your collection')).toBeInTheDocument();
      expect(screen.getByLabelText('Course Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Duration (minutes)')).toBeInTheDocument();
      expect(screen.getByText('Create Course')).toBeInTheDocument();
    });

    test('should validate required fields', async () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      // Try to submit without filling required fields
      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      // Check that validation errors are shown
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Duration is required')).toBeInTheDocument();
      });
    });

    test('should validate title length limit', async () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText('Course Title');
      
      // Try to enter more than 100 characters
      const longTitle = 'A'.repeat(101);
      fireEvent.change(titleInput, { target: { value: longTitle } });

      // Check that the input is limited to 100 characters
      expect(titleInput).toHaveValue('A'.repeat(100));
    });

    test('should validate duration minimum value', async () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      const durationInput = screen.getByLabelText('Duration (minutes)');
      
      // Enter invalid duration (0)
      fireEvent.change(durationInput, { target: { value: '0' } });

      // Try to submit
      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      // Check that validation error is shown
      await waitFor(() => {
        expect(screen.getByText('Must be greater than 0')).toBeInTheDocument();
      });
    });

    test('should successfully create a course', async () => {
      const { createCourse } = require('../../../services/courseApi');
      createCourse.mockResolvedValue({});

      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      // Fill in the form
      const titleInput = screen.getByLabelText('Course Title');
      const descriptionInput = screen.getByLabelText('Description');
      const durationInput = screen.getByLabelText('Duration (minutes)');

      fireEvent.change(titleInput, { target: { value: 'Test Course' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      fireEvent.change(durationInput, { target: { value: '120' } });

      // Submit the form
      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      // Check that API was called with correct data
      await waitFor(() => {
        expect(createCourse).toHaveBeenCalledWith({
          title: 'Test Course',
          description: 'Test Description',
          duration: 120,
        });
      });

      // Check that navigation was called
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('should show error when course creation fails', async () => {
      const { createCourse } = require('../../../services/courseApi');
      createCourse.mockRejectedValue(new Error('Failed to create course'));

      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      // Fill in the form
      const titleInput = screen.getByLabelText('Course Title');
      const durationInput = screen.getByLabelText('Duration (minutes)');

      fireEvent.change(titleInput, { target: { value: 'Test Course' } });
      fireEvent.change(durationInput, { target: { value: '120' } });

      // Submit the form
      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      // Check that error toast is shown
      await waitFor(() => {
        expect(screen.getByText('Failed to create course')).toBeInTheDocument();
      });
    });

    test('should auto-save draft to localStorage', async () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText('Course Title');
      const descriptionInput = screen.getByLabelText('Description');
      const durationInput = screen.getByLabelText('Duration (minutes)');

      // Fill in the form
      fireEvent.change(titleInput, { target: { value: 'Draft Course' } });
      fireEvent.change(descriptionInput, { target: { value: 'Draft Description' } });
      fireEvent.change(durationInput, { target: { value: '90' } });

      // Check that draft is saved to localStorage
      await waitFor(() => {
        const draft = localStorage.getItem('course-form-draft');
        expect(draft).toBeTruthy();
        const parsedDraft = JSON.parse(draft!);
        expect(parsedDraft.title).toBe('Draft Course');
        expect(parsedDraft.description).toBe('Draft Description');
        expect(parsedDraft.duration).toBe(90);
      });
    });

    test('should load draft from localStorage on mount', () => {
      // Set up draft in localStorage
      const draft = {
        title: 'Saved Draft',
        description: 'Saved Description',
        duration: 60,
      };
      localStorage.setItem('course-form-draft', JSON.stringify(draft));

      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      // Check that form is pre-filled with draft data
      expect(screen.getByDisplayValue('Saved Draft')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Saved Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    });
  });

  describe('Edit Course Flow', () => {
    const mockCourse = {
      id: '1',
      title: 'Existing Course',
      description: 'Existing Description',
      duration: 150,
      status: 'draft',
      createdAt: '2024-01-01T00:00:00Z',
      publishedAt: null,
    };

    beforeEach(() => {
      // Mock useParams to return course ID for edit mode
      jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ id: '1' });
      
      // Mock getCourses to return the course
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue([mockCourse]);
    });

    test('should render edit course form with pre-filled data', async () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      // Wait for course to load
      await waitFor(() => {
        expect(screen.getByText('Edit Course')).toBeInTheDocument();
        expect(screen.getByText('Update your course information')).toBeInTheDocument();
      });

      // Check that form is pre-filled
      expect(screen.getByDisplayValue('Existing Course')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('150')).toBeInTheDocument();
      expect(screen.getByText('Update Course')).toBeInTheDocument();
    });

    test('should successfully update a course', async () => {
      const { updateCourse } = require('../../../services/courseApi');
      updateCourse.mockResolvedValue({});

      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing Course')).toBeInTheDocument();
      });

      // Update the form
      const titleInput = screen.getByLabelText('Course Title');
      fireEvent.change(titleInput, { target: { value: 'Updated Course' } });

      // Submit the form
      const submitButton = screen.getByText('Update Course');
      fireEvent.click(submitButton);

      // Check that API was called with correct data
      await waitFor(() => {
        expect(updateCourse).toHaveBeenCalledWith('1', {
          title: 'Updated Course',
          description: 'Existing Description',
          duration: 150,
        });
      });

      // Check that navigation was called
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('should show error when course update fails', async () => {
      const { updateCourse } = require('../../../services/courseApi');
      updateCourse.mockRejectedValue(new Error('Failed to update course'));

      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing Course')).toBeInTheDocument();
      });

      // Submit the form
      const submitButton = screen.getByText('Update Course');
      fireEvent.click(submitButton);

      // Check that error toast is shown
      await waitFor(() => {
        expect(screen.getByText('Failed to update course')).toBeInTheDocument();
      });
    });

    test('should prevent editing archived courses', async () => {
      const archivedCourse = { ...mockCourse, status: 'archived' };
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockResolvedValue([archivedCourse]);

      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      // Check that archived course message is shown
      await waitFor(() => {
        expect(screen.getByText('Archived courses cannot be edited')).toBeInTheDocument();
        expect(screen.getByText('Back to Courses')).toBeInTheDocument();
      });

      // Check that form is not shown
      expect(screen.queryByLabelText('Course Title')).not.toBeInTheDocument();
    });

    test('should show loading state while fetching course', () => {
      const { getCourses } = require('../../../services/courseApi');
      getCourses.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      // Check that loading spinner is shown
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('should show character count for description', () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      const descriptionInput = screen.getByLabelText('Description');
      
      // Type some text
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

      // Check that character count is shown
      expect(screen.getByText('16/500')).toBeInTheDocument();
    });

    test('should limit description to 500 characters', () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      const descriptionInput = screen.getByLabelText('Description');
      
      // Try to enter more than 500 characters
      const longDescription = 'A'.repeat(501);
      fireEvent.change(descriptionInput, { target: { value: longDescription } });

      // Check that the input is limited to 500 characters
      expect(descriptionInput).toHaveValue('A'.repeat(500));
    });

    test('should navigate back when cancel is clicked', () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('should clear draft when course is successfully created', async () => {
      // Set up draft in localStorage
      localStorage.setItem('course-form-draft', JSON.stringify({
        title: 'Draft',
        description: 'Draft',
        duration: 60,
      }));

      const { createCourse } = require('../../../services/courseApi');
      createCourse.mockResolvedValue({});

      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      // Fill and submit form
      const titleInput = screen.getByLabelText('Course Title');
      const durationInput = screen.getByLabelText('Duration (minutes)');

      fireEvent.change(titleInput, { target: { value: 'New Course' } });
      fireEvent.change(durationInput, { target: { value: '120' } });

      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      // Check that draft is cleared after successful creation
      await waitFor(() => {
        expect(localStorage.getItem('course-form-draft')).toBeNull();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper form labels and ARIA attributes', () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      // Check that form inputs have proper labels
      expect(screen.getByLabelText('Course Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Duration (minutes)')).toBeInTheDocument();

      // Check that submit button has proper text
      expect(screen.getByRole('button', { name: 'Create Course' })).toBeInTheDocument();
    });

    test('should show validation errors with proper ARIA attributes', async () => {
      render(
        <TestWrapper>
          <CourseFormPage />
        </TestWrapper>
      );

      // Try to submit without filling required fields
      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      // Check that validation errors are shown with proper ARIA attributes
      await waitFor(() => {
        const titleInput = screen.getByLabelText('Course Title');
        expect(titleInput).toHaveAttribute('aria-invalid', 'true');
        
        const durationInput = screen.getByLabelText('Duration (minutes)');
        expect(durationInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
}); 