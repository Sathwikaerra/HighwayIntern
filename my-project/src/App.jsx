import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';

import Signup from './components/signup';
import Signin from './components/login';
import Dashboard from './components/profile';
import './App.css'

function App() {
  const user = useSelector((state) => state.user.user);
  console.log("Logged in user:", user);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          {/* Only show dashboard if logged in */}
          {user ? (
            <>
              <Route path="/profile" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/profile" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Signup />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="*" element={<Navigate to="/signin" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </>
  );
}

export default App;
