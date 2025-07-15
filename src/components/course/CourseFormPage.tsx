import React, { useEffect, useMemo, useState } from 'react';
import {
  Button, Input, Textarea, Text, Spinner, useToast, FormControl, FormLabel, FormErrorMessage, NumberInput, NumberInputField
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourseContext } from '../../store/CourseContext';
import { CourseFormData } from '../../types/course';

const DRAFT_KEY = 'course-form-draft';

const CourseFormPage: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { courses, create, update, loading, error } = useCourseContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [initialLoaded, setInitialLoaded] = useState(false);

  const course = useMemo(() => courses.find(c => c.id === id), [courses, id]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<CourseFormData>({
    defaultValues: isEdit && course ? {
      title: course.title,
      description: course.description || '',
      duration: course.duration,
    } : { title: '', description: '', duration: 0 },
  });

  // Load draft for create mode
  useEffect(() => {
    if (!isEdit && !initialLoaded) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          reset(JSON.parse(draft));
        } catch {}
      }
      setInitialLoaded(true);
    }
    if (isEdit && course) {
      reset({
        title: course.title,
        description: course.description || '',
        duration: course.duration,
      });
      setInitialLoaded(true);
    }
  }, [isEdit, course, reset, initialLoaded]);

  // Auto-save draft for create mode
  const watched = watch();
  useEffect(() => {
    if (!isEdit && isDirty) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(watched));
    }
  }, [watched, isEdit, isDirty]);



  // Remove draft on successful create
  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

  const onSubmit = async (data: CourseFormData) => {
    try {
      if (isEdit && course) {
        await update(course.id, { ...data });
        toast({ title: 'Course updated', status: 'success' });
      } else {
        await create(data);
        clearDraft();
        toast({ title: 'Course created', status: 'success' });
      }
      navigate('/');
    } catch (e: any) {
      toast({ title: e.message || 'Save failed', status: 'error' });
    }
  };

  // Business logic: prevent editing archived
  if (isEdit && course && course.status === 'archived') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <Text color="red.500" className="text-xl font-semibold">Archived courses cannot be edited</Text>
          <Button 
            onClick={() => navigate('/')} 
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white"
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (isEdit && !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Spinner size="xl" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">
                {isEdit ? '✏️' : '📝'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {isEdit ? 'Edit Course' : 'Create New Course'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEdit ? 'Update your course information' : 'Add a new course to your collection'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormControl isInvalid={!!errors.title}>
                <FormLabel className="text-lg font-semibold text-gray-700 mb-2">Course Title</FormLabel>
                <Input
                  {...register('title', { required: 'Title is required', maxLength: { value: 100, message: 'Max 100 characters' } })}
                  maxLength={100}
                  placeholder="Enter course title..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                />
                <FormErrorMessage className="text-red-500 text-sm mt-1">{errors.title?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.description}>
                <FormLabel className="text-lg font-semibold text-gray-700 mb-2">Description</FormLabel>
                <Textarea
                  {...register('description', { maxLength: { value: 500, message: 'Max 500 characters' } })}
                  maxLength={500}
                  placeholder="Describe your course..."
                  rows={4}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <FormErrorMessage className="text-red-500 text-sm">{errors.description?.message}</FormErrorMessage>
                  <Text className="text-sm text-gray-500">
                    {(watch('description') || '').length}/500
                  </Text>
                </div>
              </FormControl>
              
              <FormControl isInvalid={!!errors.duration}>
                <FormLabel className="text-lg font-semibold text-gray-700 mb-2">Duration (minutes)</FormLabel>
                <NumberInput
                  min={1}
                  value={watch('duration') || ''}
                  onChange={(valueString) => {
                    const value = parseInt(valueString);
                    if (!isNaN(value)) {
                      // @ts-ignore
                      register('duration').onChange({ target: { value } });
                    }
                  }}
                >
                  <NumberInputField
                    {...register('duration', {
                      required: 'Duration is required',
                      valueAsNumber: true,
                      min: { value: 1, message: 'Must be greater than 0' },
                    })}
                    placeholder="Enter duration in minutes..."
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                  />
                </NumberInput>
                <FormErrorMessage className="text-red-500 text-sm mt-1">{errors.duration?.message}</FormErrorMessage>
              </FormControl>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  isLoading={loading} 
                  isDisabled={isEdit && course?.status === 'archived'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? 'Saving...' : (isEdit ? 'Update Course' : 'Create Course')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <Text color="red.500" className="font-semibold">{error}</Text>
                </div>
              )}
            </form>
          </div>

          {/* Auto-save indicator */}
          {!isEdit && isDirty && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Text className="text-blue-700 text-sm">
                💾 Auto-saving draft...
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseFormPage; 