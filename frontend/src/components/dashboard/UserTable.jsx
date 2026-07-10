import dayjs from 'dayjs';
import { BadgeCheck } from 'lucide-react';
import Badge from '../ui/Badge';
import ActionMenu from './ActionMenu';
import EmptyState from '../ui/EmptyState';

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

export default function UserTable({ users, onEdit, onDelete }) {
  if (!users || users.length === 0) {
    return <EmptyState title="No users found" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-border text-xs font-semibold uppercase text-text-soft">
            <th className="py-3 pr-4">User Profile</th>
            <th className="py-3 pr-4">Email Address</th>
            <th className="py-3 pr-4">Role</th>
            <th className="py-3 pr-4">Status</th>
            <th className="py-3 pr-4">Join Date</th>
            <th className="py-3 pr-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uuid} className="border-b border-border last:border-b-0">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg text-sm font-semibold text-text-soft">
                      {getInitial(user.full_name)}
                    </div>
                  )}
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-text">
                    {user.full_name}
                    {user.is_verified && <BadgeCheck size={14} className="text-info" />}
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4 text-sm text-text-soft">{user.email}</td>
              <td className="py-3 pr-4">
                <Badge variant="neutral">{user.role.charAt(0) + user.role.slice(1).toLowerCase()}</Badge>
              </td>
              <td className="py-3 pr-4">
                <Badge variant={user.is_banned ? 'danger' : 'success'} dot>
                  {user.is_banned ? 'Banned' : 'Active'}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-sm text-text-soft">{dayjs(user.created_at).format('MMM D, YYYY')}</td>
              <td className="py-3 pr-4 text-right">
                <ActionMenu
                  items={[
                    { label: 'Edit', onClick: () => onEdit(user) },
                    { label: 'Delete', danger: true, onClick: () => onDelete(user) },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
