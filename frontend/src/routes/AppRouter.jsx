import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout, DashboardLayout } from '../layouts';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import ProfileRedirect from './ProfileRedirect';
import PagePlaceholder from '../pages/PagePlaceholder';
import { ROLES } from '../utils/constants';

// Pages that already exist are lazy-loaded for real. Pages not built
// yet render <PagePlaceholder/> below and get swapped for a lazy
// import here as each feature is implemented.
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const SignUp = lazy(() => import('../pages/SignUp'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const NotFound = lazy(() => import('../pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <p className="text-sm text-text-soft">Loading...</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Standalone auth pages — no navbar/footer, per the Figma's full-screen split layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<PagePlaceholder title="Forgot Password" />} />

          {/* Public pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<PagePlaceholder title="Browse" />} />
            <Route path="/rooms/:roomId" element={<PagePlaceholder title="Room Detail" />} />
            <Route path="/chat" element={<PagePlaceholder title="Chat" />} />
            <Route path="/chat/:conversationId" element={<PagePlaceholder title="Chat" />} />

            {/* Renter-only within the public shell */}
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute roles={[ROLES.RENTER]} />}>
                <Route path="/saved" element={<PagePlaceholder title="Saved Rooms" />} />
              </Route>
            </Route>
          </Route>

          {/* Authenticated dashboards */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfileRedirect />} />

            <Route element={<RoleRoute roles={[ROLES.RENTER]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard/renter/requests" element={<PagePlaceholder title="My Viewing Request" />} />
                <Route path="/dashboard/renter/profile" element={<PagePlaceholder title="Renter Profile" />} />
              </Route>
            </Route>

            <Route element={<RoleRoute roles={[ROLES.OWNER]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard/owner/listings" element={<PagePlaceholder title="My Listings" />} />
                <Route path="/dashboard/owner/listings/new" element={<PagePlaceholder title="Post New Room" />} />
                <Route path="/dashboard/owner/listings/:roomId/edit" element={<PagePlaceholder title="Edit Room" />} />
                <Route path="/dashboard/owner/viewing-requests" element={<PagePlaceholder title="Viewing Requests" />} />
                <Route path="/dashboard/owner/profile" element={<PagePlaceholder title="Owner Profile" />} />
              </Route>
            </Route>

            <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard/admin" element={<PagePlaceholder title="Admin Dashboard" />} />
                <Route path="/dashboard/admin/users" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
