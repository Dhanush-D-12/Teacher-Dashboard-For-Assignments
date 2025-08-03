import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentCard from '../components/AssignmentCard';

export default function Dashboard() {
  const [teacher, setTeacher] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: ''
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (teacher) {
      fetchAssignments();
    }
  }, [teacher, filters]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeacher(data.teacher);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`/api/assignments?${queryParams}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleAssignmentSubmit = async (assignmentData) => {
    await fetchAssignments();
    setShowForm(false);
    setEditingAssignment(null);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          await fetchAssignments();
        }
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: ''
    });
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
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              Welcome, {teacher?.firstName} {teacher?.lastName}
            </h1>
            <button
              onClick={() => {
                setEditingAssignment(null);
                setShowForm(!showForm);
              }}
              className="btn btn-primary"
            >
              {showForm ? 'Cancel' : 'Create New Assignment'}
            </button>
          </div>

          {showForm && (
            <div className="form-section">
              <AssignmentForm
                assignment={editingAssignment}
                onSubmit={handleAssignmentSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAssignment(null);
                }}
              />
            </div>
          )}

          <div className="filters-section">
            <h2 className="section-title">Filter Assignments</h2>
            <div className="filters-grid">
              <div className="form-group">
                <label htmlFor="search" className="form-label">Search by Title</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="form-input"
                  placeholder="Search assignments..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="startDate" className="form-label">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate" className="form-label">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary"
                  style={{ marginTop: '24px' }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="assignments-section">
            <h2 className="section-title">
              Your Assignments ({assignments.length})
            </h2>
            
            {assignments.length === 0 ? (
              <div className="empty-state">
                <h3>No assignments found</h3>
                <p>Create your first assignment to get started!</p>
              </div>
            ) : (
              <div className="assignments-grid">
                {assignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment._id}
                    assignment={assignment}
                    onEdit={handleEditAssignment}
                    onDelete={handleDeleteAssignment}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}