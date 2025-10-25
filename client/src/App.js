import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import VersionChecker from './VersionChecker';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import StreamView from './pages/StreamView';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import ChannelActions from './pages/ChannelActions';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <VersionChecker />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/channel-actions" 
              element={
                <PrivateRoute>
                  <ChannelActions />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } 
            />
            <Route path="/stream/:streamId" element={<StreamView />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
