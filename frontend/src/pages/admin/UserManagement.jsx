import { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import UserTable from '../../features/admin/components/UserTable';
import usersIcon from '../../assets/users.svg';
import ownersIcon from '../../assets/owners.svg';
import rentersIcon from '../../assets/renters.svg';
import searchIcon from '../../assets/search.svg';
import './UserManagement.css';

const SERVICE_BY_TAB = {
  ALL:    { list: adminService.getUsers,   del: adminService.deleteUser   },
  OWNER:  { list: adminService.getOwners,  del: adminService.deleteOwner  },
  RENTER: { list: adminService.getRenters, del: adminService.deleteRenter },
};

const USERS_PER_PAGE = 10;

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({ total: 0, owners: 0, renters: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService
      .getAnalytics()
      .then((res) => {
        const userStats = res.data.data.analytics.users || {};
        setStats({
          total:   userStats.total  || 0,
          owners:  userStats.OWNER  || 0,
          renters: userStats.RENTER || 0,
        });
      })
      .catch((err) => {
        console.error('Analytics load failed:', err);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    SERVICE_BY_TAB[activeTab]
      .list({ page: currentPage, limit: USERS_PER_PAGE, search: searchQuery || undefined })
      .then((res) => {
        const data = res.data.data;
        setUsers(data.users || data.owners || data.renters || []);
        setTotalUsers(data.total || 0);
      })
      .catch((err) => {
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;
        if (status === 401 || status === 403) {
          setError('You must be logged in as an ADMIN to view this page.');
        } else {
          setError(msg || 'Failed to load users.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeTab, searchQuery, currentPage]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handleSearch(e) {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }

  async function handleBan(uuid) {
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    try {
      await adminService.banUser(uuid);
      setUsers((prev) =>
        prev.map((u) => (u.uuid === uuid ? { ...u, is_banned: true } : u))
      );
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert('Failed to ban user: ' + msg);
    }
  }

  async function handleUnban(uuid) {
    try {
      await adminService.unbanUser(uuid);
      setUsers((prev) =>
        prev.map((u) => (u.uuid === uuid ? { ...u, is_banned: false } : u))
      );
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert('Failed to unban user: ' + msg);
    }
  }

  async function handleVerify(uuid) {
    if (!window.confirm('Are you sure you want to verify this owner?')) return;
    try {
      await adminService.verifyOwner(uuid);
      setUsers((prev) =>
        prev.map((u) => (u.uuid === uuid ? { ...u, is_verified: true } : u))
      );
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert('Failed to verify owner: ' + msg);
    }
  }

  async function handleDelete(uuid, name) {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) return;
    try {
      await SERVICE_BY_TAB[activeTab].del(uuid);
      setUsers((prev) => prev.filter((u) => u.uuid !== uuid));
      setTotalUsers((prev) => prev - 1);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert('Failed to delete user: ' + msg);
    }
  }

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3, '...', totalPages);
    }
    return pages;
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Dashboard</h1>
      <p className="admin-page__subtitle">
        Review and manage property submissions. Ensure every listing meets RoomEase's premium quality standards.
      </p>

      <div className="stat-cards">
        <div className="stat-card">
          <div>
            <p className="stat-card__label">Total Users</p>
            <p className="stat-card__value">{stats.total.toLocaleString()}</p>
          </div>
          <div className="stat-card__icon-wrap">
            <img src={usersIcon} alt="Users Icon" style={{ width: '22px', height: '22px' }} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p className="stat-card__label">Total Owners</p>
            <p className="stat-card__value">{stats.owners.toLocaleString()}</p>
          </div>
          <div className="stat-card__icon-wrap">
            <img src={ownersIcon} alt="Owners Icon" style={{ width: '22px', height: '22px' }} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p className="stat-card__label">Total Renters</p>
            <p className="stat-card__value">{stats.renters.toLocaleString()}</p>
          </div>
          <div className="stat-card__icon-wrap">
            <img src={rentersIcon} alt="Renters Icon" style={{ width: '22px', height: '22px' }} />
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="tabs">
          {['ALL', 'OWNER', 'RENTER'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab === 'ALL'    && 'All Users'}
              {tab === 'OWNER'  && 'Owners'}
              {tab === 'RENTER' && 'Renters'}
            </button>
          ))}
        </div>

        <div className="search-bar">
          <div className="search-bar__icon">
            <img src={searchIcon} alt="Search Icon" style={{ width: '16px', height: '16px' }} />
          </div>
          <input
            type="text"
            className="search-bar__input"
            placeholder="Search name, email, or user ID..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {loading && (
          <p className="state-message">Loading users...</p>
        )}

        {!loading && error && (
          <p className="state-message state-message--error">{error}</p>
        )}

        {!loading && !error && (
          <UserTable
            users={users}
            onBan={handleBan}
            onUnban={handleUnban}
            onVerify={handleVerify}
            onDelete={handleDelete}
          />
        )}

        {!loading && totalPages > 1 && (
          <div className="pagination">
            <p className="pagination__info">
              Showing {((currentPage - 1) * USERS_PER_PAGE) + 1}–
              {Math.min(currentPage * USERS_PER_PAGE, totalUsers)} of {totalUsers.toLocaleString()}
            </p>

            <div className="pagination__buttons">
              <button
                className="pagination__btn"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                {'<'}
              </button>

              {getPageNumbers().map((page, index) =>
                page === '...' ? (
                  <span key={`ellip-${index}`} style={{ padding: '0 4px', color: '#aaa' }}>...</span>
                ) : (
                  <button
                    key={`page-${page}`}
                    className={`pagination__btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="pagination__btn"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
              >
                {'>'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
