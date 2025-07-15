import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course } from '../types/course';
import * as api from '../services/courseApi';

interface CourseContextType {
  courses: Course[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  create: (data: Omit<Course, 'id' | 'createdAt' | 'publishedAt' | 'status'>) => Promise<void>;
  update: (id: string, data: Partial<Course>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (startIndex: number, endIndex: number) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const useCourseContext = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourseContext must be used within CourseProvider');
  return ctx;
};

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      setCourses(await api.getCourses());
    } catch (e: any) {
      setError(e.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const create = async (data: Omit<Course, 'id' | 'createdAt' | 'publishedAt' | 'status'>) => {
    setLoading(true);
    setError(null);
    try {
      await api.createCourse(data);
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Partial<Course>) => {
    setLoading(true);
    setError(null);
    try {
      await api.updateCourse(id, data);
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteCourse(id);
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  const reorder = (startIndex: number, endIndex: number) => {
    setCourses(prevCourses => {
      const newCourses = [...prevCourses];
      const [removed] = newCourses.splice(startIndex, 1);
      newCourses.splice(endIndex, 0, removed);
      return newCourses;
    });
  };

  return (
    <CourseContext.Provider value={{ courses, loading, error, refresh, create, update, remove, reorder }}>
      {children}
    </CourseContext.Provider>
  );
}; 