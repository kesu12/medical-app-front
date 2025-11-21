import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  return (
    <main className="page page--home">
      <section className="hero">
        <h1 className="hero__title">Welcome to Medical Application</h1>
        <p className="hero__subtitle">Your health, our priority.</p>
        <div className="hero__actions">
          <Link to="/login" className="btn btn--ghost btn--lg">Login</Link>
          <Link to="/register" className="btn btn--primary btn--lg">Register</Link>
        </div>
      </section>
    </main>
  );
}

export default Home;


