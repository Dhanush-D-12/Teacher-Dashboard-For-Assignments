import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header({ teacher }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">TeacherDash</span>
        </Link>

        <nav className="header-nav">
          {teacher ? (
            <div className="nav-authenticated">
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <div className="user-info">
                <span className="user-name">
                  {teacher.firstName} {teacher.lastName}
                </span>
                <button onClick={handleLogout} className="btn btn-outline">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="nav-guest">
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}