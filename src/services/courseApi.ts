import { Course, CourseFormData } from '../types/course';

const STORAGE_KEY = 'courses';
const randomDelay = () => new Promise(res => setTimeout(res, 100 + Math.random() * 400));

function getCoursesFromStorage(): Course[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCoursesToStorage(courses: Course[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

export async function getCourses(): Promise<Course[]> {
  await randomDelay();
  if (Math.random() < 0.05) throw { status: 500, message: 'Network error' };
  return getCoursesFromStorage();
}

export async function getCourse(id: string): Promise<Course> {
  await randomDelay();
  const course = getCoursesFromStorage().find(c => c.id === id);
  if (!course) throw { status: 404, message: 'Course not found' };
  return course;
}

export async function createCourse(data: CourseFormData): Promise<Course> {
  await randomDelay();
  if (!data.title || data.duration <= 0) throw { status: 400, message: 'Invalid data' };
  const newCourse: Course = {
    id: Math.random().toString(36).substr(2, 9),
    title: data.title,
    description: data.description,
    duration: data.duration,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  const courses = getCoursesFromStorage();
  courses.push(newCourse);
  saveCoursesToStorage(courses);
  return newCourse;
}

export async function updateCourse(id: string, data: Partial<CourseFormData> & { status?: Course['status'] }): Promise<Course> {
  await randomDelay();
  const courses = getCoursesFromStorage();
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) throw { status: 404, message: 'Course not found' };
  if (courses[idx].status === 'archived') throw { status: 403, message: 'Cannot edit archived course' };
  courses[idx] = { ...courses[idx], ...data };
  if (data.status === 'published' && !courses[idx].publishedAt) {
    courses[idx].publishedAt = new Date().toISOString();
  }
  saveCoursesToStorage(courses);
  return courses[idx];
}

export async function deleteCourse(id: string): Promise<void> {
  await randomDelay();
  let courses = getCoursesFromStorage();
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) throw { status: 404, message: 'Course not found' };
  courses.splice(idx, 1);
  saveCoursesToStorage(courses);
} 