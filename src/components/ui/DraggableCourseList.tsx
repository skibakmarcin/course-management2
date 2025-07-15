import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Text, Spinner, useToast } from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CheckIcon, RepeatIcon, DragHandleIcon } from '@chakra-ui/icons';
import { formatDuration } from '../../utils/formatDuration';
import { formatDate } from '../../utils/formatDate';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';

interface DraggableCourseListProps {
  courses: any[];
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

const truncate = (str: string, n: number) => (str.length > n ? str.slice(0, n) + '…' : str);

// Sortable Course Item Component
const SortableCourseItem: React.FC<{ course: any; index: number; onDelete: (id: string) => void; onPublish: (id: string) => void; onArchive: (id: string) => void }> = ({ 
  course, 
  index, 
  onDelete, 
  onPublish, 
  onArchive 
}) => {
  const navigate = useNavigate();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col lg:flex-row p-6 items-start lg:items-center justify-between gap-4 transition-all duration-200 ${
        index !== 0 ? 'border-t border-gray-100' : ''
      } ${
        isDragging ? 'bg-blue-50 shadow-lg rotate-2 scale-105 z-50' : 'bg-white'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-grab active:cursor-grabbing transition-colors duration-200 mr-4"
      >
        <DragHandleIcon className="text-gray-500" />
      </div>

      {/* Course Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-gray-800 truncate">{course.title}</h3>
          <StatusBadge status={course.status} />
        </div>
        <p className="text-gray-600 mb-3 leading-relaxed">
          {truncate(course.description || '', 120)}
        </p>
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

      {/* Actions */}
      <div className="flex flex-wrap gap-2 shrink-0">
        <Button
          size="sm"
          leftIcon={<EditIcon />}
          onClick={() => navigate(`/edit/${course.id}`)}
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
};

export const DraggableCourseList: React.FC<DraggableCourseListProps> = ({
  courses,
  loading,
  error,
  onDelete,
  onPublish,
  onArchive,
  onReorder
}) => {
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = courses.findIndex(course => course.id === active.id);
      const newIndex = courses.findIndex(course => course.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
        toast({
          title: 'Course order updated',
          status: 'success',
          duration: 2000,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="xl" className="text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Text color="red.500" className="text-lg font-semibold">{error}</Text>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="text-gray-400 text-6xl mb-4">📚</div>
        <Text className="text-xl font-semibold text-gray-600 mb-2">No courses found</Text>
        <Text className="text-gray-500">Try adjusting your filters or create a new course</Text>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={courses.map(course => course.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {courses.map((course, index) => (
            <SortableCourseItem
              key={course.id}
              course={course}
              index={index}
              onDelete={onDelete}
              onPublish={onPublish}
              onArchive={onArchive}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}; 