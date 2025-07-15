import React, { useState, useMemo } from 'react';
import {
  Button, Input, SimpleGrid, Text, Spinner, useToast, Select, IconButton
} from '@chakra-ui/react';
import { ViewOffIcon, EditIcon, DeleteIcon, CheckIcon, RepeatIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useCourseContext } from '../../store/CourseContext';
import { COURSE_STATUSES } from '../../constants/courseStatus';
import { COURSE_SORT_OPTIONS } from '../../constants/sortOptions';
import { formatDate } from '../../utils/formatDate';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../ui/StatusBadge';
import { DraggableCourseList } from '../ui/DraggableCourseList';
import { Course } from '../../types/course';
import { formatDuration } from '../../utils/formatDuration';

// Utility function
const truncate = (str: string, n: number) => (str.length > n ? str.slice(0, n) + '…' : str);

// Types
type ViewMode = 'grid' | 'list' | 'drag';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  status: string;
  search: string;
  sortBy: string;
  sortOrder: SortOrder;
  view: ViewMode;
  showAdvancedFilters: boolean;
  dateRange: { start: string; end: string };
  durationRange: { min: string; max: string };
}

// Header Component
const Header: React.FC<{ onCreateCourse: () => void }> = ({ onCreateCourse }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Course Management</h1>
      <p className="text-gray-600">Manage and organize your educational content</p>
    </div>
    <Button 
      colorScheme="blue" 
      onClick={onCreateCourse}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
    >
      + Create Course
    </Button>
  </div>
);

// View Toggle Component
const ViewToggle: React.FC<{ view: ViewMode; onViewChange: (view: ViewMode) => void }> = ({ view, onViewChange }) => (
  <div className="flex gap-2">
    <IconButton
      aria-label="Grid view"
      icon={<span className="text-lg">⊞</span>}
      colorScheme={view === 'grid' ? 'blue' : 'gray'}
      onClick={() => onViewChange('grid')}
      className="rounded-lg"
    />
    <IconButton
      aria-label="List view"
      icon={<span className="text-lg">☰</span>}
      colorScheme={view === 'list' ? 'blue' : 'gray'}
      onClick={() => onViewChange('list')}
      className="rounded-lg"
    />
    <IconButton
      aria-label="Drag & drop view"
      icon={<span className="text-lg">⋮⋮</span>}
      colorScheme={view === 'drag' ? 'blue' : 'gray'}
      onClick={() => onViewChange('drag')}
      className="rounded-lg"
    />
  </div>
);

// Filter Controls Component
const FilterControls: React.FC<{
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onToggleAdvancedFilters: () => void;
  onClearAdvancedFilters: () => void;
  onViewChange: (view: ViewMode) => void;
  hasAdvancedFilters: boolean;
  filteredCount: number;
  totalCount: number;
}> = ({ 
  filters, 
  onFilterChange, 
  onToggleAdvancedFilters, 
  onClearAdvancedFilters, 
  onViewChange,
  hasAdvancedFilters, 
  filteredCount, 
  totalCount 
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
    <div className="flex flex-col lg:flex-row gap-4 items-center">
      <Select 
        value={filters.status} 
        onChange={(e) => onFilterChange('status', e.target.value)} 
        className="w-full lg:w-48 bg-gray-50 border-gray-200 rounded-lg"
      >
        {COURSE_STATUSES.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>
      
      <Input 
        placeholder="Search courses..." 
        value={filters.search} 
        onChange={(e) => onFilterChange('search', e.target.value)}
        className="w-full lg:w-64 bg-gray-50 border-gray-200 rounded-lg"
      />
      
      <Select 
        value={filters.sortBy} 
        onChange={(e) => onFilterChange('sortBy', e.target.value)} 
        isDisabled={filters.view === 'drag'}
        className="w-full lg:w-48 bg-gray-50 border-gray-200 rounded-lg"
      >
        {COURSE_SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>
      
      <Select 
        value={filters.sortOrder} 
        onChange={(e) => onFilterChange('sortOrder', e.target.value as SortOrder)} 
        isDisabled={filters.view === 'drag'}
        className="w-full lg:w-32 bg-gray-50 border-gray-200 rounded-lg"
      >
        <option value="asc">↑ Ascending</option>
        <option value="desc">↓ Descending</option>
      </Select>
      
      <ViewToggle view={filters.view} onViewChange={onViewChange} />
    </div>

    {/* Advanced Filters Toggle */}
    <div className="mt-4 pt-4 border-t border-gray-200">
      <Button
        variant="ghost"
        onClick={onToggleAdvancedFilters}
        className="text-blue-600 hover:bg-blue-50"
        rightIcon={filters.showAdvancedFilters ? <ChevronUpIcon /> : <ChevronDownIcon />}
      >
        Advanced Filters
      </Button>
    </div>

    {/* Advanced Filters */}
    {filters.showAdvancedFilters && (
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              className="w-full bg-gray-50 border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => onFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              className="w-full bg-gray-50 border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Duration (min)</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.durationRange.min}
              onChange={(e) => onFilterChange('durationRange', { ...filters.durationRange, min: e.target.value })}
              className="w-full bg-gray-50 border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Duration (min)</label>
            <Input
              type="number"
              placeholder="∞"
              value={filters.durationRange.max}
              onChange={(e) => onFilterChange('durationRange', { ...filters.durationRange, max: e.target.value })}
              className="w-full bg-gray-50 border-gray-200 rounded-lg"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onClearAdvancedFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Clear Filters
          </Button>
          {hasAdvancedFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filteredCount} of {totalCount} courses
            </span>
          )}
        </div>
      </div>
    )}
  </div>
);

// Course Card Component
const CourseCard: React.FC<{
  course: Course;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
}> = ({ course, onEdit, onDelete, onPublish, onArchive }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4 gap-3">
        <h3 className="text-xl font-bold text-gray-800 leading-tight flex-1 min-w-0">{truncate(course.title, 40)}</h3>
        <div className="flex-shrink-0">
          <StatusBadge status={course.status} />
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 leading-relaxed">{truncate(course.description || '', 80)}</p>
      
      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-6">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          {formatDuration(course.duration)}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Created: {formatDate(course.createdAt)}
        </span>
        {course.status === 'published' && course.publishedAt && (
          <span className="text-gray-500">
            Published: {formatDate(course.publishedAt)}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          leftIcon={<EditIcon />} 
          onClick={() => onEdit(course.id)} 
          isDisabled={course.status === 'archived'}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
        >
          Edit
        </Button>
        {course.status === 'draft' && (
          <Button 
            size="sm" 
            leftIcon={<CheckIcon />} 
            colorScheme="green" 
            onClick={() => onPublish(course.id)} 
            isDisabled={!course.title || !course.duration}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Publish
          </Button>
        )}
        {course.status === 'published' && (
          <Button 
            size="sm" 
            leftIcon={<RepeatIcon />} 
            colorScheme="yellow" 
            onClick={() => onArchive(course.id)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Archive
          </Button>
        )}
        <Button 
          size="sm" 
          leftIcon={<DeleteIcon />} 
          colorScheme="red" 
          onClick={() => onDelete(course.id)}
          className="bg-red-500 hover:bg-red-600 text-white"
        />
      </div>
    </div>
  </div>
);

// Course List Item Component
const CourseListItem: React.FC<{
  course: Course;
  index: number;
  totalItems: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
}> = ({ course, index, totalItems, onEdit, onDelete, onPublish, onArchive }) => (
  <div className={`flex flex-col lg:flex-row p-6 items-start lg:items-center justify-between gap-4 ${index !== totalItems - 1 ? 'border-b border-gray-100' : ''}`}>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-xl font-bold text-gray-800 truncate flex-1 min-w-0">{course.title}</h3>
        <div className="flex-shrink-0">
          <StatusBadge status={course.status} />
        </div>
      </div>
      <p className="text-gray-600 mb-3 leading-relaxed">{truncate(course.description || '', 120)}</p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          {formatDuration(course.duration)}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Created: {formatDate(course.createdAt)}
        </span>
        {course.status === 'published' && course.publishedAt && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            Published: {formatDate(course.publishedAt)}
          </span>
        )}
      </div>
    </div>
    
    <div className="flex flex-wrap gap-2 shrink-0">
      <Button 
        size="sm" 
        leftIcon={<EditIcon />} 
        onClick={() => onEdit(course.id)} 
        isDisabled={course.status === 'archived'}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
      >
        Edit
      </Button>
      {course.status === 'draft' && (
        <Button 
          size="sm" 
          leftIcon={<CheckIcon />} 
          colorScheme="green" 
          onClick={() => onPublish(course.id)} 
          isDisabled={!course.title || !course.duration}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Publish
        </Button>
      )}
      {course.status === 'published' && (
        <Button 
          size="sm" 
          leftIcon={<RepeatIcon />} 
          colorScheme="yellow" 
          onClick={() => onArchive(course.id)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Archive
        </Button>
      )}
      <Button 
        size="sm" 
        leftIcon={<DeleteIcon />} 
        colorScheme="red" 
        onClick={() => onDelete(course.id)}
        className="bg-red-500 hover:bg-red-600 text-white"
      />
    </div>
  </div>
);

// Loading State Component
const LoadingState: React.FC = () => (
  <div className="flex justify-center items-center min-h-64">
    <Spinner size="xl" className="text-blue-600" />
  </div>
);

// Error State Component
const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <Text color="red.500" className="text-lg font-semibold">{error}</Text>
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
    <div className="text-gray-400 text-6xl mb-4">📚</div>
    <Text className="text-xl font-semibold text-gray-600 mb-2">No courses found</Text>
    <Text className="text-gray-500">Try adjusting your filters or create a new course</Text>
  </div>
);

// Drag Instructions Component
const DragInstructions: React.FC = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <div className="flex items-center gap-2">
      <span className="text-blue-600 text-lg">💡</span>
      <Text className="text-blue-800 font-medium">
        Drag & Drop Mode: Click and drag the handle (⋮⋮) to reorder courses. Sorting is disabled in this mode.
      </Text>
    </div>
  </div>
);

// Main Component
const CourseListPage: React.FC = () => {
  const { courses, loading, error, remove, update, reorder } = useCourseContext();
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    view: 'grid',
    showAdvancedFilters: false,
    dateRange: { start: '', end: '' },
    durationRange: { min: '', max: '' }
  });

  // Computed values
  const filtered = useMemo(() => {
    let filtered = courses;
    
    // Basic filters
    if (filters.status !== 'all') filtered = filtered.filter(c => c.status === filters.status);
    if (filters.search) filtered = filtered.filter(c => c.title.toLowerCase().includes(filters.search.toLowerCase()));
    
    // Advanced filters
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter(c => new Date(c.createdAt) >= startDate);
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(c => new Date(c.createdAt) <= endDate);
    }
    if (filters.durationRange.min) {
      const minDuration = parseInt(filters.durationRange.min);
      filtered = filtered.filter(c => c.duration >= minDuration);
    }
    if (filters.durationRange.max) {
      const maxDuration = parseInt(filters.durationRange.max);
      filtered = filtered.filter(c => c.duration <= maxDuration);
    }
    
    // Only apply sorting if not in drag mode
    if (filters.view !== 'drag') {
      filtered = [...filtered].sort((a, b) => {
        let cmp = 0;
        if (filters.sortBy === 'title') cmp = a.title.localeCompare(b.title);
        else if (filters.sortBy === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        else if (filters.sortBy === 'duration') cmp = a.duration - b.duration;
        return filters.sortOrder === 'asc' ? cmp : -cmp;
      });
    }
    
    return filtered;
  }, [courses, filters]);

  const hasAdvancedFilters = Boolean(filters.dateRange.start || filters.dateRange.end || filters.durationRange.min || filters.durationRange.max);

  // Event handlers
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleAdvancedFilters = () => {
    setFilters(prev => ({ ...prev, showAdvancedFilters: !prev.showAdvancedFilters }));
  };

  const handleViewChange = (view: ViewMode) => {
    setFilters(prev => ({ ...prev, view }));
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast({ title: 'Course deleted', status: 'success' });
    } catch (e: any) {
      toast({ title: e.message || 'Delete failed', status: 'error' });
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await update(id, { status: 'published' });
      toast({ title: 'Course published', status: 'success' });
    } catch (e: any) {
      toast({ title: e.message || 'Publish failed', status: 'error' });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await update(id, { status: 'archived' });
      toast({ title: 'Course archived', status: 'success' });
    } catch (e: any) {
      toast({ title: e.message || 'Archive failed', status: 'error' });
    }
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    reorder(startIndex, endIndex);
  };

  const clearAdvancedFilters = () => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start: '', end: '' },
      durationRange: { min: '', max: '' }
    }));
  };

  // Render states
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (filtered.length === 0) return <EmptyState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Header onCreateCourse={() => navigate('/create')} />
        
        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          onToggleAdvancedFilters={handleToggleAdvancedFilters}
          onClearAdvancedFilters={clearAdvancedFilters}
          onViewChange={handleViewChange}
          hasAdvancedFilters={hasAdvancedFilters}
          filteredCount={filtered.length}
          totalCount={courses.length}
        />

        {filters.view === 'drag' && <DragInstructions />}

        {filters.view === 'drag' ? (
          <DraggableCourseList
            courses={filtered}
            loading={loading}
            error={error}
            onDelete={handleDelete}
            onPublish={handlePublish}
            onArchive={handleArchive}
            onReorder={handleReorder}
          />
        ) : filters.view === 'grid' ? (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
            {filtered.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={(id) => navigate(`/edit/${id}`)}
                onDelete={handleDelete}
                onPublish={handlePublish}
                onArchive={handleArchive}
              />
            ))}
          </SimpleGrid>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {filtered.map((course, index) => (
              <CourseListItem
                key={course.id}
                course={course}
                index={index}
                totalItems={filtered.length}
                onEdit={(id) => navigate(`/edit/${id}`)}
                onDelete={handleDelete}
                onPublish={handlePublish}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseListPage; 