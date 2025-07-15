import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CourseProvider } from './store/CourseContext';
import CourseListPage from './components/course/CourseListPage';
import CourseFormPage from './components/course/CourseFormPage';

function App() {
  return (
    <ChakraProvider>
      <CourseProvider>
        <Router>
          <Routes>
            <Route path="/" element={<CourseListPage />} />
            <Route path="/create" element={<CourseFormPage />} />
            <Route path="/edit/:id" element={<CourseFormPage />} />
          </Routes>
        </Router>
      </CourseProvider>
    </ChakraProvider>
  );
}

export default App;
