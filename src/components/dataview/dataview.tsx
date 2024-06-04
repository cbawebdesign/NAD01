import { useEffect, useState } from 'react';

interface Group {
  id: string;
  name: string;
  users: { name: string; email: string; id: string }[];
  members: string[];
  created: string | null;
}

interface Post {
  id: string;
  categories: string;
}

const GroupsPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [inputName, setInputName] = useState<string>('');
  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputId, setInputId] = useState<string>('');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [userToDelete, setUserToDelete] = useState<string>('');
  const [memberToDelete, setMemberToDelete] = useState<string>('');
  const [groupIdToDelete, setGroupIdToDelete] = useState<string>('');
  const [memberPosts, setMemberPosts] = useState<{ [key: string]: Post[] }>({});
  const [visibleMembers, setVisibleMembers] = useState<{ [key: string]: boolean }>({});
  const [updatedCategories, setUpdatedCategories] = useState<string[]>([]);
  const [userIds, setUserIds] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/datatwo/datatwo');
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
        const data = await response.json();
        const normalizedData = data.map((group: any) => ({
          ...group,
          users: Array.isArray(group.users) ? group.users : [],
          members: Array.isArray(group.members) ? group.members : [],
        }));
        setGroups(normalizedData);
        setFilteredGroups(normalizedData);
        setLoading(false);
      } catch (err) {
        const errMsg = (err instanceof Error) ? err.message : 'An unknown error occurred';
        setError(errMsg);
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredGroups(groups.filter(group => group.name.toLowerCase().includes(query)));
  };

  const handleButtonClick = (group: Group) => {
    setSelectedGroup(group);
    setShowPopup(true);
  };

  const handlePermissionButtonClick = (group: Group) => {
    setSelectedGroup(group);
    setShowPermissionPopup(true);
  };

  const handleInputNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(event.target.value);
  };

  const handleInputEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputEmail(event.target.value);
  };

  const handleInputIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputId(event.target.value);
  };

  const handleConfirm = async () => {
    if (selectedGroup) {
      try {
        const newMember = { name: inputName, email: inputEmail, id: inputId };
        const response = await fetch('/api/addmember/addmember', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ groupId: selectedGroup.id, newMember }),
        });
        if (!response.ok) {
          throw new Error('Failed to add member');
        }
        setGroups(groups.map(group =>
          group.id === selectedGroup.id
            ? { ...group, users: [...group.users, newMember] }
            : group
        ));
        setFilteredGroups(filteredGroups.map(group =>
          group.id === selectedGroup.id
            ? { ...group, users: [...group.users, newMember] }
            : group
        ));
        setSuccessMessage(`Success! Added ${inputName} to group ${selectedGroup.name}`);
        setInputName('');
        setInputEmail('');
        setInputId('');
        setShowPopup(false);
      } catch (error) {
        const errMsg = (error instanceof Error) ? error.message : 'An unknown error occurred';
        setError(errMsg);
      }
    }
  };

  const handlePermissionConfirm = async () => {
    if (selectedGroup) {
      try {
        const response = await fetch('/api/permcloud/permcloud', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ groupId: selectedGroup.id, member: inputName }),
        });
        if (!response.ok) {
          throw new Error('Failed to add permission');
        }
        const result = await response.json();
        setGroups(groups.map(group =>
          group.id === selectedGroup.id
            ? { ...group, members: [...group.members, inputName] }
            : group
        ));
        setFilteredGroups(filteredGroups.map(group =>
          group.id === selectedGroup.id
            ? { ...group, members: [...group.members, inputName] }
            : group
        ));
        setUpdatedCategories(result.updatedCategories);
        setSuccessMessage(`Success! Added permission for ${inputName} to group ${selectedGroup.name}`);
        setInputName('');
        setInputEmail('');
        setInputId('');
        setShowPermissionPopup(false);
      } catch (error) {
        const errMsg = (error instanceof Error) ? error.message : 'An unknown error occurred';
        setError(errMsg);
      }
    }
  };

  const handleDelete = (groupId: string, userId: string) => {
    setGroupIdToDelete(groupId);
    setUserToDelete(userId);
    setShowConfirm(true);
  };

  const handleMemberDelete = (groupId: string, memberId: string) => {
    setGroupIdToDelete(groupId);
    setMemberToDelete(memberId);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch('/api/deletemember/deletemember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId: groupIdToDelete, id: userToDelete }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete member');
      }
      setGroups(groups.map(group =>
        group.id === groupIdToDelete
          ? { ...group, users: group.users.filter(u => u.id !== userToDelete) }
          : group
      ));
      setFilteredGroups(filteredGroups.map(group =>
        group.id === groupIdToDelete
          ? { ...group, users: group.users.filter(u => u.id !== userToDelete) }
          : group
      ));
      setSuccessMessage(`Success! Deleted user from group.`);
      setShowConfirm(false);
      setUserToDelete('');
      setGroupIdToDelete('');
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'An unknown error occurred';
      setError(errMsg);
    }
  };

  const confirmMemberDelete = async () => {
    try {
      const response = await fetch('/api/deletemember2/deletemember2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId: groupIdToDelete, member: memberToDelete }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete member');
      }
      setGroups(groups.map(group =>
        group.id === groupIdToDelete
          ? { ...group, members: group.members.filter(m => m !== memberToDelete) }
          : group
      ));
      setFilteredGroups(filteredGroups.map(group =>
        group.id === groupIdToDelete
          ? { ...group, members: group.members.filter(m => m !== memberToDelete) }
          : group
      ));
      setSuccessMessage(`Success! Deleted member from group.`);
      setShowConfirm(false);
      setMemberToDelete('');
      setGroupIdToDelete('');
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'An unknown error occurred';
      setError(errMsg);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setUserToDelete('');
    setGroupIdToDelete('');
    setMemberToDelete('');
  };

  const handleMemberClick = async (member: string) => {
    if (visibleMembers[member]) {
      setVisibleMembers(prev => ({ ...prev, [member]: false }));
    } else {
      setVisibleMembers(prev => ({ ...prev, [member]: true }));
      if (!memberPosts[member]) {
        try {
          const response = await fetch(`/api/getmemberposts/getmemberposts?member=${member}`);
          if (!response.ok) {
            throw new Error('Failed to fetch member posts');
          }
          const posts = await response.json();
          posts.sort((a: Post, b: Post) => a.categories.localeCompare(b.categories));
          setMemberPosts(prevPosts => ({ ...prevPosts, [member]: posts }));
        } catch (error) {
          const errMsg = (error instanceof Error) ? error.message : 'An unknown error occurred';
          setError(errMsg);
        }
      }
    }
  };

  const handleIdClick = (userId: string) => {
    setUserIds(prevState => ({ ...prevState, [userId]: !prevState[userId] }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="group-list">
      <h1>Group List</h1>
      <input
        type="text"
        placeholder="Search groups..."
        value={searchQuery}
        onChange={handleSearchChange}
      />
      {successMessage && <div className="success-message">{successMessage}</div>}
      <ul>
        {filteredGroups.map(group => (
          <li key={group.id} className="group-box">
            <p><strong>Name:</strong> {group.name}</p>
            <p><strong>Created:</strong> {formatDate(group.created)}</p>
            <p><strong>Users:</strong></p>
            <ul className="user-list">
              {group.users && group.users.length > 0 ? (
                group.users.map((user, index) => (
                  <li key={index} className="user-item">
                    <span>{user.name} ({user.email})</span>
                    <button className="id-button" onClick={() => handleIdClick(user.id)}>Show ID</button>
                    {userIds[user.id] && <span>ID: {user.id}</span>}
                    <button className="delete-button" onClick={() => handleDelete(group.id, user.id)}>Delete User</button>
                  </li>
                ))
              ) : (
                <li>No users</li>
              )}
            </ul>
            <p><strong>Members:</strong></p>
            <ul className="member-list">
              {group.members && group.members.length > 0 ? (
                group.members.map((member, index) => (
                  <li key={index} className="member-item">
                    <div className="member-info">
                      <span onClick={() => handleMemberClick(member)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {member}
                      </span>
                      <button className="delete-button" onClick={() => handleMemberDelete(group.id, member)}>Delete Member</button>
                    </div>
                    {visibleMembers[member] && memberPosts[member] && (
                      <div className="posts-container">
                        {memberPosts[member].map(post => (
                          <div key={post.id} className="post-item">{post.categories}</div>
                        ))}
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li>No members</li>
              )}
            </ul>
            <div className="button-container">
              <button onClick={() => handleButtonClick(group)}>Add Member</button>
              <button onClick={() => handlePermissionButtonClick(group)}>Add Permission</button>
            </div>
          </li>
        ))}
      </ul>

      {updatedCategories.length > 0 && (
        <div className="updated-categories">
          <h2>Updated Categories</h2>
          <ul>
            {updatedCategories.map((category, index) => (
              <li key={index}>{category}</li>
            ))}
          </ul>
        </div>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Add Member to {selectedGroup?.name}</h2>
            <input
              type="text"
              placeholder="Name"
              value={inputName}
              onChange={handleInputNameChange}
            />
            <input
              type="email"
              placeholder="Email"
              value={inputEmail}
              onChange={handleInputEmailChange}
            />
            <input
              type="text"
              placeholder="ID"
              value={inputId}
              onChange={handleInputIdChange}
            />
            <button onClick={handleConfirm}>Confirm</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showPermissionPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Add Permission to {selectedGroup?.name}</h2>
            <input
              type="text"
              placeholder="Name"
              value={inputName}
              onChange={handleInputNameChange}
            />
            <button onClick={handlePermissionConfirm}>Confirm</button>
            <button onClick={() => setShowPermissionPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="popup">
          <div className="popup-content">
            <h2>Are you sure you want to delete {userToDelete || memberToDelete}?</h2>
            <button onClick={userToDelete ? confirmDelete : confirmMemberDelete}>Yes</button>
            <button onClick={cancelDelete}>No</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .group-list {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        input[type="text"], input[type="email"], input[type="text"] {
          padding: 10px;
          margin-bottom: 20px;
          width: 80%;
          max-width: 400px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          width: 100%;
        }
        .group-box {
          border: 1px solid #ccc;
          border-radius: 5px;
          margin: 10px;
          padding: 20px;
          width: 80%;
          max-width: 800px;
          text-align: left;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          color: #1E90FF;
          font-weight: bold;
        }
        .group-box p {
          margin: 0 0 10px 0;
          font-weight: bold;
        }
        .user-list, .member-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }
        .user-item, .member-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
        }
        .user-item span, .member-item span {
          flex: 1;
        }
        .id-button, .delete-button {
          margin-left: 10px;
          background-color: #ff6347;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .id-button:hover, .delete-button:hover {
          background-color: #ff4500;
        }
        .button-container {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        .group-box button {
          padding: 10px 15px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .group-box button:hover {
          background-color: #005bb5;
        }
        .member-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .posts-container {
          display: flex;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .post-item {
          background-color: #0070f3;
          color: white;
          padding: 10px 25px;
          border-radius: 20px;
          margin: 5px;
          text-align: center;
          width: calc(33.33% - 10px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .updated-categories {
          margin: 20px 0;
          padding: 10px 20px;
          background-color: #e0ffe0;
          border: 1px solid #a0ffa0;
          border-radius: 5px;
          color: #007000;
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
        .popup-content input {
          margin: 10px 0;
          padding: 10px;
          width: 80%;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .popup-content button {
          padding: 10px 15px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 10px;
        }
        .popup-content button:hover {
          background-color: #005bb5;
        }
        .success-message {
          margin: 20px 0;
          padding: 10px 20px;
          background-color: #e0ffe0;
          border: 1px solid #a0ffa0;
          border-radius: 5px;
          color: #007000;
        }
      `}</style>
    </div>
  );
};

export default GroupsPage;
