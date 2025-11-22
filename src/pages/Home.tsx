import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import '../App.css';

function Home() {
  const { t } = useLanguage();
  
  return (
    <main className="page page--home">
      <section className="hero">
        <h1 className="hero__title">{t('home.welcome')}</h1>
        <p className="hero__subtitle">{t('home.subtitle')}</p>
        <div className="hero__actions">
          <Link to="/login" className="btn btn--ghost btn--lg">{t('auth.login')}</Link>
          <Link to="/register" className="btn btn--primary btn--lg">{t('auth.register')}</Link>
        </div>
      </section>
    </main>
  );
}

export default Home;


