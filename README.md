# Course Management App

A modern, full-featured React application for managing educational courses. Built with React 19, Chakra UI, Tailwind CSS, and robust state management and testing practices.

---

## 1. Setup Instructions

### Prerequisites
- Node.js >= 16
- npm >= 8

### Installation
```sh
git clone <your-repo-url>
cd course-management
npm install
```

### Running the App
```sh
npm start
```
The app will be available at [http://localhost:3000](http://localhost:3000).

### Running Tests
```sh
npm test
```
Runs all unit and integration tests using Jest and React Testing Library.

### Building for Production
```sh
npm run build
```
Builds the app for deployment to the `build/` directory.

---

## 2. Architecture Decisions

- **React 19 + TypeScript**: Modern, type-safe, and future-proof for scalable UI development.
- **Component Structure**: 
  - `src/components/course/` — Page-level and form components for course management
  - `src/components/ui/` — Reusable UI elements (badges, dialogs, drag & drop, etc.)
- **State Management**: 
  - Uses React Context (`src/store/CourseContext.tsx`) for global course state, with async actions for CRUD and reordering
- **Styling**: 
  - **Chakra UI** for accessible, themeable components
  - **Tailwind CSS** for utility-first, responsive design
- **Drag & Drop**: 
  - Uses `@dnd-kit` for modern, accessible drag-and-drop reordering
- **API Layer**: 
  - `src/services/courseApi.ts` abstracts all backend interactions (mocked for local dev/testing)
- **Testing**: 
  - Jest + React Testing Library for unit and integration tests
  - Mocks for API and browser APIs in `src/setupTests.ts`
- **Accessibility**: 
  - ARIA labels, keyboard navigation, and color contrast considered throughout

---

## 3. Feature Explanations

### Course Management
- **Create, Edit, Delete**: Full CRUD for courses, with form validation and error handling
- **Publish/Archive**: Change course status with one click
- **Drafts**: Auto-save and restore in-progress course forms

### Filtering & Sorting
- **Status Filter**: Filter by draft, published, archived, or all
- **Search**: Instant search by course title
- **Advanced Filters**: Filter by creation date range and duration range
- **Sorting**: Sort by title, creation date, or duration (asc/desc)

### Drag & Drop Reordering
- **Drag View**: Switch to drag mode to reorder courses visually
- **Persistence**: Order is maintained in state (can be extended to persist to backend)

### UI/UX
- **Responsive Design**: Works on all screen sizes
- **Accessible**: Keyboard navigation, ARIA labels, and color contrast
- **Visual Feedback**: Toasts, badges, and clear error messages

---

## 4. Testing Approach

- **Unit & Integration Tests**: All critical user flows are covered:
  - Viewing, filtering, searching, and sorting courses
  - Creating, editing, publishing, archiving, and deleting courses
  - Drag & drop reordering
  - Form validation and error handling
  - Accessibility checks (labels, ARIA, keyboard navigation)
- **Testing Tools**:
  - **Jest**: Test runner and assertion library
  - **React Testing Library**: For rendering components and simulating user interactions
  - **Mocking**: API and browser APIs are mocked for deterministic, fast tests
- **Test Organization**:
  - Tests are colocated in `__tests__` folders next to the code they cover
  - Global setup and mocks in `src/setupTests.ts`
- **How to Run**:
  - `npm test` — Runs all tests
  - Coverage and watch modes are supported

---

For more details, see the code comments and test files. Enjoy building and managing your courses!
