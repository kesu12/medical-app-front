import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Departments from './pages/Departments';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Cabinet from './pages/Cabinet';
import NurseCabinet from './pages/NurseCabinet';
import AuthModal from './components/AuthModal';
import { UserProvider, useUser } from './contexts/UserContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <div className="app">
      <LanguageProvider>
        <UserProvider>
          <BrowserRouter>
            <AppInner />
          </BrowserRouter>
        </UserProvider>
      </LanguageProvider>
    </div>
  );
}

function AppInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser, user, loading } = useUser();
  const [authType, setAuthType] = useState<null | 'login' | 'register'>(null);

  function openLogin() {
    // Не открываем логин, если пользователь уже залогинен
    if (user) {
      return;
    }
    setAuthType('login');
  }

  function openRegister() {
    // Не открываем регистрацию, если пользователь уже залогинен
    if (user) {
      return;
    }
    setAuthType('register');
  }

  function closeAuth() {
    setAuthType(null);
  }

  useEffect(() => {
    // Если пользователь залогинен и пытается зайти на страницы логина/регистрации - редиректим
    if (!loading && user && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/');
      return;
    }

    // Редиректим неавторизованных пользователей с защищенных страниц
    if (!loading && !user) {
      const protectedRoutes = ['/doctors', '/departments', '/admin-users', '/profile', '/settings', '/cabinet', '/nurse-cabinet'];
      if (protectedRoutes.includes(location.pathname)) {
        navigate('/');
        return;
      }
      
      if (location.pathname === '/login') {
        openLogin();
      } else if (location.pathname === '/register') {
        openRegister();
      } else if (location.pathname !== '/login' && location.pathname !== '/register') {
        // ensure modal closed on other routes
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (authType) {
          closeAuth();
        }
      }
    } else if (!loading && user) {
      // Если пользователь залогинен, закрываем любые открытые модальные окна
      if (authType) {
        closeAuth();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user, loading]);

  function handleCloseAuth() {
    closeAuth();
    if (location.pathname === '/login' || location.pathname === '/register') {
      navigate('/');
    }
  }

  return (
    <>
      <Header onOpenLogin={openLogin} onOpenRegister={openRegister} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Home />} />
        <Route path="/register" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/cabinet" element={<Cabinet />} />
        <Route path="/nurse-cabinet" element={<NurseCabinet />} />
      </Routes>
      {authType && !user && (
        <AuthModal open={!!authType} type={authType} onClose={handleCloseAuth} onSuccess={refreshUser} />
      )}
    </>
  );
}

export default App;
