import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { StatusBadge } from '../StatusBadge';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    {children}
  </ChakraProvider>
);

describe('StatusBadge', () => {
  describe('Status Display', () => {
    test('should display draft status correctly', () => {
      render(
        <TestWrapper>
          <StatusBadge status="draft" />
        </TestWrapper>
      );

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    test('should display published status correctly', () => {
      render(
        <TestWrapper>
          <StatusBadge status="published" />
        </TestWrapper>
      );

      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    test('should display archived status correctly', () => {
      render(
        <TestWrapper>
          <StatusBadge status="archived" />
        </TestWrapper>
      );

      expect(screen.getByText('Archived')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    test('should have correct styling for draft status', () => {
      render(
        <TestWrapper>
          <StatusBadge status="draft" />
        </TestWrapper>
      );

      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    test('should have correct styling for published status', () => {
      render(
        <TestWrapper>
          <StatusBadge status="published" />
        </TestWrapper>
      );

      const badge = screen.getByText('Published');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    test('should have correct styling for archived status', () => {
      render(
        <TestWrapper>
          <StatusBadge status="archived" />
        </TestWrapper>
      );

      const badge = screen.getByText('Archived');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <StatusBadge status="draft" />
        </TestWrapper>
      );

      const badge = screen.getByText('Draft');
      expect(badge).toHaveAttribute('role', 'status');
    });

    test('should be accessible to screen readers', () => {
      render(
        <TestWrapper>
          <StatusBadge status="published" />
        </TestWrapper>
      );

      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Published');
    });
  });
}); 