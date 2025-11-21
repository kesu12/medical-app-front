import React, { useState } from 'react';
import Modal from './Modal';
import '../App.css';
import { login as apiLogin, register as apiRegister } from '../api/auth';

type AuthType = 'login' | 'register';

type AuthModalProps = {
  open: boolean;
  type: AuthType;
  onClose: () => void;
  onSuccess?: () => void;
};

function AuthModal({ open, type, onClose, onSuccess }: AuthModalProps) {
  // Shared
  const [password, setPassword] = useState('');
  // Login-specific
  const [usernameLogin, setUsernameLogin] = useState('');
  // Register-specific
  const [usernameReg, setUsernameReg] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = type === 'register';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        await apiRegister({
          username: usernameReg,
          email,
          password,
          confirmPassword,
          firstName,
          lastName,
          middleName
        });
      } else {
        await apiLogin(usernameLogin, password);
      }
      // Wait for user data to be refreshed before closing
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} title={isRegister ? 'Create account' : 'Login'} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        {isRegister ? (
          <>
            <label className="form__field">
              <span className="form__label">Username</span>
              <input
                type="text"
                className="form__input"
                value={usernameReg}
                onChange={e => setUsernameReg(e.target.value)}
                required
              />
            </label>
            <label className="form__field">
              <span className="form__label">Email</span>
              <input
                type="email"
                className="form__input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>
            <div className="form__row">
              <label className="form__field" style={{flex: 1}}>
                <span className="form__label">First name</span>
                <input
                  type="text"
                  className="form__input"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </label>
              <label className="form__field" style={{flex: 1}}>
                <span className="form__label">Middle name</span>
                <input
                  type="text"
                  className="form__input"
                  value={middleName}
                  onChange={e => setMiddleName(e.target.value)}
                />
              </label>
            </div>
            <label className="form__field">
              <span className="form__label">Last name</span>
              <input
                type="text"
                className="form__input"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </label>
            <label className="form__field">
              <span className="form__label">Password</span>
              <input
                type="password"
                className="form__input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>
            <label className="form__field">
              <span className="form__label">Confirm password</span>
              <input
                type="password"
                className="form__input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </label>
          </>
        ) : (
          <>
            <label className="form__field">
              <span className="form__label">Username</span>
              <input
                type="text"
                className="form__input"
                value={usernameLogin}
                onChange={e => setUsernameLogin(e.target.value)}
                required
              />
            </label>
            <label className="form__field">
              <span className="form__label">Password</span>
              <input
                type="password"
                className="form__input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>
          </>
        )}
        {error && <div className="form__error">{error}</div>}
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Please wait…' : isRegister ? 'Register' : 'Login'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default AuthModal;


