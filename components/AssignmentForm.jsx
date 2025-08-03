import { useState, useEffect } from 'react';

export default function AssignmentForm({ assignment, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline ? assignment.deadline.split('T')[0] : ''
      });
    }
  }, [assignment]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('deadline', formData.deadline);
      
      if (file) {
        formDataToSend.append('file', file);
      }

      const url = assignment ? `/api/assignments/${assignment._id}` : '/api/assignments';
      const method = assignment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        credentials: 'include',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        onSubmit(data);
        setFormData({ title: '', description: '', deadline: '' });
        setFile(null);
      } else {
        setError(data.error || 'Failed to save assignment');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assignment-form-container">
      <h2 className="form-title">
        {assignment ? 'Edit Assignment' : 'Create New Assignment'}
      </h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Assignment Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter assignment title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="form-textarea"
            placeholder="Enter assignment description"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="deadline" className="form-label">Deadline *</label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="file" className="form-label">
            Attachment {assignment ? '(Upload new file to replace current)' : '(PDF or Image)'}
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.gif"
            className="form-file"
          />
          {assignment && assignment.fileName && (
            <p className="current-file">
              Current file: <strong>{assignment.fileName}</strong>
            </p>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : (assignment ? 'Update Assignment' : 'Create Assignment')}
          </button>
        </div>
      </form>
    </div>
  );
}