import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DocumentForm } from './pages/DocumentForm';
import { Search } from './pages/Search';
import TeamPage from './pages/TeamPage';
import DocumentDetailPage from "./pages/DocumentDetailPage"
import { QA } from './pages/QA';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
import JoinTeam from './components/JoinTeam';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';

import { SocketListener } from './components/SocketListner';

function App() {
  const { user,team } = useAuthStore();
  console.log("User : " , user);
  console.log("Team : " , team);



  

  

  return (
    <Router>
      <SocketListener/>
      <div className="App">
        <Routes>
          <Route path='/joinTeam' element={user?.teamId && user?.teamId?.length > 0 ? <Navigate to={"/dashboard"} replace/> : <JoinTeam/>}/>

          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
                
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/new"
            element={
              <ProtectedRoute>
                <Layout><DocumentForm /></Layout>
                
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
          <Route path='/document/edit/:documentId' element={<ProtectedRoute><DocumentDetailPage/></ProtectedRoute>}/>
          
          <Route path='/team' element={<ProtectedRoute><TeamPage/></ProtectedRoute>}/>
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
      <Toaster/>
    </Router>
  );
}

export default App;