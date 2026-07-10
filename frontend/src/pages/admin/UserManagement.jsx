import { useEffect, useState } from 'react';
import { Users as UsersIcon, KeyRound, UserRound, Search } from 'lucide-react';
import UserTable from '../../components/dashboard/UserTable';
import EditUserModal from '../../components/dashboard/EditUserModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/dashboard/Pagination';
import ErrorState from '../../components/ui/ErrorState';
import * as adminService from '../../services/adminService';
import { notify } from '../../context/ToastConfig';

const TABS = [
  { key: 'ALL', label: 'All Users' },
  { key: 'OWNER', label: 'Owners' },
  { key: 'RENTER', label: 'Renters' },
];
const PAGE_SIZE = 10;

// Maps the active tab to the correct role-specific service calls, since
// /admin/renters and /admin/owners are separate endpoints from the
// generic /admin/users.
const SERVICE_BY_TAB = {
  ALL: { list: adminService.getUsers, update: adminService.updateUser, del: adminService.deleteUser },
  OWNER: { list: adminService.getOwners, update: adminService.updateOwner, del: adminService.deleteOwner },
  RENTER: { list: adminService.getRenters, update: adminService.updateRenter, del: adminService.deleteRenter },
};

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, owners: 0, renters: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminService
      .getAnalytics()
      .then((res) => {
        const userStats = res.data.data.analytics.users || {};
        setStats({ total: userStats.total || 0, owners: userStats.OWNER || 0, renters: userStats.RENTER || 0 });
      })
      .catch(() => {});
  }, []);

  function loadUsers() {
    setLoading(true);
    setError(null);

    SERVICE_BY_TAB[activeTab]
      .list({ page, limit: PAGE_SIZE, search: searchQuery || undefined })
      .then((res) => {
        setUsers(res.data.data.users || res.data.data.owners || res.data.data.renters || []);
        setTotal(res.data.data.total ?? 0);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchQuery, page]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setPage(1);
  }

  async function handleSaveEdit(payload) {
    setBusy(true);
    try {
      await SERVICE_BY_TAB[activeTab].update(editTarget.uuid, payload);
      notify.success('User updated successfully.');
      setEditTarget(null);
      loadUsers();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmDelete() {
    setBusy(true);
    try {
      await SERVICE_BY_TAB[activeTab].del(deleteTarget.uuid);
      notify.success('User deleted.');
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusy(false);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Dashboard</h1>
      <p className="mt-1 text-sm text-text-soft">
        Review and manage property submissions. Ensure every listing meets RoomEase's premium quality standards.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={stats.total} icon={UsersIcon} />
        <StatCard label="Total Owners" value={stats.owners} icon={KeyRound} />
        <StatCard label="Total Renters" value={stats.renters} icon={UserRound} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-bg-card p-6">
        <div className="flex gap-6 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
                activeTab === tab.key ? 'border-gold-dark text-gold-dark' : 'border-transparent text-text-soft'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative mt-4 max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, or user ID..."
            className="w-full rounded-lg border border-border py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
          />
        </div>

        <div className="mt-5">
          {error && <ErrorState message="Couldn't load users." onRetry={loadUsers} />}
          {!error && loading && <p className="text-sm text-text-soft">Loading users...</p>}
          {!error && !loading && <UserTable users={users} onEdit={setEditTarget} onDelete={setDeleteTarget} />}
        </div>

        {!error && !loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-text-soft">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <EditUserModal
        open={!!editTarget}
        user={editTarget}
        saving={busy}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.full_name}?`}
        description="This will permanently delete this user's account. This action can't be undone."
        confirmLabel="Delete"
        loading={busy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-bg-card p-5">
      <div>
        <p className="text-sm text-text-soft">{label}</p>
        <p className="mt-1 text-2xl font-bold text-text">{value.toLocaleString()}</p>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-text-soft">
        <Icon size={20} />
      </span>
    </div>
  );
}
