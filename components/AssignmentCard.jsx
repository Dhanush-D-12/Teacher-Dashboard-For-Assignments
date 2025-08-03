export default function AssignmentCard({ assignment, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const handleDownload = (filename) => {
    window.open(`/api/assignments/download/${filename}`, '_blank');
  };

  return (
    <div className={`assignment-card ${isOverdue(assignment.deadline) ? 'overdue' : ''}`}>
      <div className="assignment-header">
        <h3 className="assignment-title">{assignment.title}</h3>
        <div className="assignment-actions">
          <button
            onClick={() => onEdit(assignment)}
            className="btn btn-small btn-outline"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(assignment._id)}
            className="btn btn-small btn-danger"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="assignment-description">{assignment.description}</p>

      <div className="assignment-meta">
        <div className="assignment-deadline">
          <strong>Deadline:</strong>{' '}
          <span className={isOverdue(assignment.deadline) ? 'overdue-text' : ''}>
            {formatDate(assignment.deadline)}
          </span>
          {isOverdue(assignment.deadline) && (
            <span className="overdue-badge">Overdue</span>
          )}
        </div>
        
        <div className="assignment-created">
          <strong>Created:</strong> {formatDate(assignment.createdAt)}
        </div>
      </div>

      {assignment.fileName && (
        <div className="assignment-file">
          <button
            onClick={() => handleDownload(assignment.filePath)}
            className="file-download-btn"
          >
            📎 Download: {assignment.fileName}
          </button>
        </div>
      )}
    </div>
  );
}