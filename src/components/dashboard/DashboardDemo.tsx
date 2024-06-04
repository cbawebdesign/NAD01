import { useEffect, useState } from 'react';

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  notes: string[];
  created: string;
  flagged: boolean;
}

const RequestsPage = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newRequest, setNewRequest] = useState<{ title: string; description: string; flagged: boolean }>({ title: '', description: '', flagged: false });
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [note, setNote] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/getrequests/getrequests');
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await response.json();
        setRequests(data);
        setLoading(false);
      } catch (err) {
        const errMsg = (err instanceof Error) ? err.message : 'An unknown error occurred';
        setError(errMsg);
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAddRequest = async () => {
    try {
      const response = await fetch('/api/addrequest/addrequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRequest),
      });
      if (!response.ok) {
        throw new Error('Failed to add request');
      }
      const data = await response.json();
      setRequests([...requests, { ...newRequest, id: data.id, status: 'pending', notes: [], created: new Date().toISOString() }]);
      setNewRequest({ title: '', description: '', flagged: false });
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'An unknown error occurred';
      setError(errMsg);
    }
  };

  const handleUpdateRequest = async (id: string, status: string, note: string, flagged: boolean) => {
    try {
      const response = await fetch('/api/updaterequest/updaterequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status, note, flagged }),
      });
      if (!response.ok) {
        throw new Error('Failed to update request');
      }
      setRequests(requests.map(req => (req.id === id ? { ...req, status, notes: [...req.notes, note], flagged } : req)));
      setSelectedRequest(null);
      setNote('');
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'An unknown error occurred';
      setError(errMsg);
    }
  };

  const toggleFlag = async (id: string, currentFlag: boolean) => {
    try {
      const response = await fetch('/api/updaterequest/updaterequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, flagged: !currentFlag }),
      });
      if (!response.ok) {
        throw new Error('Failed to update request');
      }
      setRequests(requests.map(req => (req.id === id ? { ...req, flagged: !currentFlag } : req)));
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'An unknown error occurred';
      setError(errMsg);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const response = await fetch('/api/deleterequest/deleterequest', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to delete request');
      }
      setRequests(requests.filter(req => req.id !== id));
      setConfirmDelete({ show: false, id: null });
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'An unknown error occurred';
      setError(errMsg);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="requests-page">
      <h1>Customer Service Requests</h1>
      <div className="new-request">
        <h2>Add New Request</h2>
        <input
          type="text"
          placeholder="Title"
          value={newRequest.title}
          onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
          className="transparent-input"
        />
        <textarea
          placeholder="Description"
          value={newRequest.description}
          onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
          className="transparent-input"
        />
        <label className="flag-label">
          <span
            className={`flag ${newRequest.flagged ? 'active' : ''}`}
            onClick={() => setNewRequest({ ...newRequest, flagged: !newRequest.flagged })}
          >
            🚩
          </span>
          <input
            type="checkbox"
            checked={newRequest.flagged}
            onChange={(e) => setNewRequest({ ...newRequest, flagged: e.target.checked })}
          />
          Needs Attention
        </label>
        <button onClick={handleAddRequest}>Add Request</button>
      </div>
      <ul>
        {requests.map(request => (
          <li key={request.id} className="request-box">
            <p><strong>Title:</strong> {request.title}</p>
            <p><strong>Description:</strong> {request.description}</p>
            <p><strong>Status:</strong> {request.status}</p>
            <p><strong>Created:</strong> {new Date(request.created).toLocaleString()}</p>
            <p><strong>Notes:</strong></p>
            <ul>
              {Array.isArray(request.notes) ? (
                request.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))
              ) : (
                <li>No notes available</li>
              )}
            </ul>
            <div className="actions">
              <label className="flag-label">
                {request.flagged && (
                  <span
                    className={`flag ${request.flagged ? 'active' : ''}`}
                    onClick={() => toggleFlag(request.id, request.flagged)}
                  >
                    🚩
                  </span>
                )}
                <input
                  type="checkbox"
                  checked={request.flagged}
                  onChange={() => toggleFlag(request.id, request.flagged)}
                />
                Needs Attention
              </label>
              <button className="action-button" onClick={() => setSelectedRequest(request)}>Add Note / Mark as Complete</button>
              <button className="delete-button" onClick={() => setConfirmDelete({ show: true, id: request.id })}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {selectedRequest && (
        <div className="popup">
          <div className="popup-content">
            <h2>Update Request: {selectedRequest.title}</h2>
            <textarea
              placeholder="Add a note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="transparent-input"
            />
            <button onClick={() => handleUpdateRequest(selectedRequest.id, 'completed', note, selectedRequest.flagged)}>Mark as Complete</button>
            <button onClick={() => handleUpdateRequest(selectedRequest.id, selectedRequest.status, note, selectedRequest.flagged)}>Add Note</button>
            <button onClick={() => setSelectedRequest(null)}>Cancel</button>
          </div>
        </div>
      )}

      {confirmDelete.show && (
        <div className="popup">
          <div className="popup-content">
            <h2>Are you sure you want to delete this request?</h2>
            <button onClick={() => handleDeleteRequest(confirmDelete.id!)}>Yes, Delete</button>
            <button onClick={() => setConfirmDelete({ show: false, id: null })}>Cancel</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .requests-page {
          padding: 20px;
        }
        .new-request, .request-box, .popup-content {
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .transparent-input {
          background-color: transparent;
          color: gray;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 10px;
          width: 100%;
          margin-bottom: 10px;
        }
        .transparent-input::placeholder {
          color: gray;
        }
        .flag-label {
          display: flex;
          align-items: center;
        }
        .flag {
          cursor: pointer;
          font-size: 20px;
          margin-right: 10px;
        }
        .flag.active {
          color: red;
        }
        button {
          padding: 10px 20px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 10px; /* Added margin for spacing */
        }
        button:hover {
          background-color: #005bb5;
        }
        .delete-button {
          background-color: #ff4d4d;
        }
        .delete-button:hover {
          background-color: #e60000;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        .request-box {
          color: #1E90FF;
        }
        .request-box p {
          margin: 0 0 10px 0;
          font-weight: bold;
        }
        .request-box ul {
          list-style: none;
          padding-left: 20px;
          margin: 0;
        }
        .request-box ul li {
          font-weight: normal;
          color: #1E90FF;
        }
        .actions {
          display: flex;
          align-items: center;
          margin-top: 10px;
        }
        .actions .flag-label {
          margin-right: 10px;
        }
        .actions .action-button {
          margin-left: 10px;
        }
        .popup {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .popup-content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .popup-content h2 {
          margin: 0 0 10px 0;
        }
      `}</style>
    </div>
  );
};

export default RequestsPage;
