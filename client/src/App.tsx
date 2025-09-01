import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DocumentForm } from './pages/DocumentForm';
import { Search } from './pages/Search';
import { QA } from './pages/QA';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import JoinTeam from './components/JoinTeam';
import { Toaster } from 'react-hot-toast';


function App() {
  const { user,team } = useAuthStore();
  

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/joinTeam' element={team ? <Navigate to={"/dashboard"}/> : <JoinTeam/>}/>

          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/new"
            element={
              <ProtectedRoute>
                <DocumentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id/edit"
            element={
              <ProtectedRoute>
                <DocumentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa"
            element={
              <ProtectedRoute>
                <QA />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
      <Toaster/>
    </Router>
  );
}

export default App;