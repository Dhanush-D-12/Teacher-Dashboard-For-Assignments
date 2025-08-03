export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">TeacherDash</h3>
            <p className="footer-description">
              Streamline your assignment management with our comprehensive teacher dashboard.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">Features</h4>
            <ul className="footer-list">
              <li>Assignment Creation</li>
              <li>File Management</li>
              <li>Deadline Tracking</li>
              <li>Search & Filter</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">Support</h4>
            <ul className="footer-list">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Documentation</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 TeacherDash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}