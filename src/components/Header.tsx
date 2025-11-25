import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import NotificationBell from './NotificationBell';

type HeaderProps = {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
};

function Header({ onOpenLogin, onOpenRegister }: HeaderProps) {
  const { user, logout } = useUser();
  const { t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  async function handleLogout() {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  }

  const avatarSrc = user?.avatarUrl || '/avatar.png';

  return (
    <header className="app-header">
      <div className="app-header__left">
        <Link to="/" className="app-header__logo-link" aria-label="Health & Life">
          <img src="/logo_Done3.png" alt="Health & Life" className="app-header__logo" />
        </Link>
        {user && (
        <nav className="app-header__nav">
          <Link to="/doctors" className="btn btn--ghost">{t('header.doctors')}</Link>
            <Link to="/departments" className="btn btn--ghost">{t('header.departments')}</Link>
            {user.role === 'ADMIN' && (
              <Link to="/admin-users" className="btn btn--ghost">{t('header.users')}</Link>
            )}
            {user.role === 'NURSE' && (
              <Link to="/nurse-cabinet" className="btn btn--ghost">{t('header.nurseCabinet')}</Link>
            )}
        </nav>
        )}
      </div>
      <div className="app-header__actions">
        {user ? (
          <>
            {(user.role === 'PATIENT' || user.role === 'DOCTOR' || user.role === 'NURSE') && (
              <Link to="/cabinet" className="btn btn--ghost">{t('header.cabinet')}</Link>
            )}
            <NotificationBell />
            <div className="app-header__user-menu" ref={dropdownRef}>
              <button
                className="app-header__avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
              >
                <img src={avatarSrc} alt="Avatar" className="app-header__avatar" />
              </button>
              {dropdownOpen && (
                <div className="app-header__dropdown">
                  <Link
                    to="/profile"
                    className="app-header__dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {t('header.profile')}
                  </Link>
                  <Link
                    to="/settings"
                    className="app-header__dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {t('header.settings')}
                  </Link>
                  <button
                    className="app-header__dropdown-item app-header__dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    {t('header.logout')}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button className="btn btn--ghost" onClick={onOpenLogin}>{t('header.login')}</button>
            <button className="btn btn--primary" onClick={onOpenRegister}>{t('header.register')}</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;


