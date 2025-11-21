import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../logo.svg';
import '../App.css';
import { useUser } from '../contexts/UserContext';

type HeaderProps = {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
};

function Header({ onOpenLogin, onOpenRegister }: HeaderProps) {
  const { user, logout } = useUser();
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
        <Link to="/" className="app-header__logo-link" aria-label="Home">
          <img src={logo} alt="Medical App" className="app-header__logo" />
        </Link>
        <nav className="app-header__nav">
          <Link to="/doctors" className="btn btn--ghost">Doctors</Link>
        </nav>
      </div>
      <div className="app-header__actions">
        {user ? (
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
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="app-header__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  Settings
                </Link>
                <button
                  className="app-header__dropdown-item app-header__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="btn btn--ghost" onClick={onOpenLogin}>Login</button>
            <button className="btn btn--primary" onClick={onOpenRegister}>Register</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;


