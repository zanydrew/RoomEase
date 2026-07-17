import { useState } from 'react';
import verifiedIcon from '../../../assets/check-badge.svg';
import './UserTable.css';
import dayjs from 'dayjs';

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

export default function UserTable({ users, onBan, onUnban, onVerify, onDelete }) {
  const [activeMenuUserId, setActiveMenuUserId] = useState(null);

  if (!users || users.length === 0) {
    return <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>No users found.</p>;
  }

  return (
    <table className="user-table">
      <thead>
        <tr>
          <th>User Profile</th>
          <th>Email Address</th>
          <th>Role</th>
          <th>Status</th>
          <th>Join Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.uuid}>
            <td>
              <div className="user-profile">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="user-profile__avatar"
                  />
                ) : (
                  <div className="user-profile__avatar--fallback">
                    {getInitial(user.full_name)}
                  </div>
                )}
                <span className="user-profile__name">
                  {user.full_name}
                  {user.is_verified && (
                    <img
                      src={verifiedIcon}
                      alt="Verified Landlord"
                      style={{ width: '14px', height: '14px', marginLeft: '6px', verticalAlign: 'middle' }}
                      title="Verified Landlord"
                    />
                  )}
                </span>
              </div>
            </td>
            <td>{user.email}</td>
            <td>
              <span className="role-badge">
                {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
              </span>
            </td>
            <td>
              <div className="status">
                <span className={`status__dot status__dot--${user.is_banned ? 'banned' : 'active'}`} />
                {user.is_banned ? 'Banned' : 'Active'}
              </div>
            </td>
            <td>{dayjs(user.created_at).format('MMM D, YYYY')}</td>
            <td>
              <div className="action-menu-container">
                <button
                  className="action-btn"
                  onClick={() => setActiveMenuUserId(activeMenuUserId === user.uuid ? null : user.uuid)}
                  title="Toggle action menu"
                >
                  ···
                </button>
                {activeMenuUserId === user.uuid && (
                  <div className="action-dropdown">
                    {user.is_banned ? (
                      <button
                        className="action-dropdown__item action-dropdown__item--unban"
                        onClick={() => { onUnban(user.uuid); setActiveMenuUserId(null); }}
                      >
                        Unban User
                      </button>
                    ) : (
                      <button
                        className="action-dropdown__item action-dropdown__item--ban"
                        onClick={() => { onBan(user.uuid); setActiveMenuUserId(null); }}
                      >
                        Ban User
                      </button>
                    )}
                    {user.role === 'OWNER' && !user.is_verified && (
                      <button
                        className="action-dropdown__item action-dropdown__item--verify"
                        onClick={() => { onVerify(user.uuid); setActiveMenuUserId(null); }}
                      >
                        Verify Owner
                      </button>
                    )}
                    <button
                      className="action-dropdown__item action-dropdown__item--delete"
                      onClick={() => { onDelete(user.uuid, user.full_name); setActiveMenuUserId(null); }}
                    >
                      Delete User
                    </button>
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
