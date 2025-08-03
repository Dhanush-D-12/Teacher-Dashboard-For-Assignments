import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeacher(data.teacher);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header teacher={teacher} />
      <main className="home-main">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Teacher Assignment Dashboard</h1>
            <p className="hero-description">
              Manage your assignments efficiently with our comprehensive dashboard. 
              Create, organize, and track assignments with ease.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="btn btn-primary">
                Login
              </Link>
              <Link href="/signup" className="btn btn-secondary">
                Sign Up
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="feature-grid">
              <div className="feature-card">
                <h3>📝 Create Assignments</h3>
                <p>Easily create and manage assignments with deadlines and file attachments</p>
              </div>
              <div className="feature-card">
                <h3>📊 Track Progress</h3>
                <p>Monitor assignment deadlines and keep track of all your teaching materials</p>
              </div>
              <div className="feature-card">
                <h3>🔍 Search & Filter</h3>
                <p>Quickly find assignments using our powerful search and filtering tools</p>
              </div>
              <div className="feature-card">
                <h3>📱 Responsive Design</h3>
                <p>Access your dashboard from any device - desktop, tablet, or mobile</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}