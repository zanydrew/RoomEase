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
const Browse = lazy(() => import('../pages/Browse'));
const RoomDetail = lazy(() => import('../pages/RoomDetail'));
const Saved = lazy(() => import('../pages/Saved'));
const Chat = lazy(() => import('../pages/chat/Chat'));
const MyViewingRequests = lazy(() => import('../pages/renter/MyViewingRequests'));
const RenterProfile = lazy(() => import('../pages/renter/RenterProfile'));
const MyListings = lazy(() => import('../pages/owner/MyListings'));
const PostRoom = lazy(() => import('../pages/owner/PostRoom'));
const EditRoom = lazy(() => import('../pages/owner/EditRoom'));
const OwnerViewingRequests = lazy(() => import('../pages/owner/OwnerViewingRequests'));
const OwnerProfile = lazy(() => import('../pages/owner/OwnerProfile'));
const Login = lazy(() => import('../pages/Login'));
const SignUp = lazy(() => import('../pages/SignUp'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const NotFound = lazy(() => import('../pages/NotFound'));
// const Report = lazy(() => import('../pages/owner/Report'));
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
            <Route path="/browse" element={<Browse />} />
            <Route path="/rooms/:roomId" element={<RoomDetail />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:conversationId" element={<Chat />} />

              {/* Renter and Owner within the public shell */}
              <Route element={<RoleRoute roles={[ROLES.RENTER, ROLES.OWNER]} />}>
                <Route path="/saved" element={<Saved />} />
              </Route>
            </Route>
          </Route>

          {/* Authenticated dashboards */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfileRedirect />} />

            <Route element={<RoleRoute roles={[ROLES.RENTER]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard/renter/requests" element={<MyViewingRequests />} />
                <Route path="/dashboard/renter/profile" element={<RenterProfile />} />
              </Route>
            </Route>

            <Route element={<RoleRoute roles={[ROLES.OWNER]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard/owner/listings" element={<MyListings />} />
                <Route path="/dashboard/owner/listings/new" element={<PostRoom />} />
                <Route path="/dashboard/owner/listings/:roomId/edit" element={<EditRoom />} />
                <Route path="/dashboard/owner/viewing-requests" element={<OwnerViewingRequests />} />
                <Route path="/dashboard/owner/profile" element={<OwnerProfile />} />
                <Route path="/dashboard/owner/reports" element={<PagePlaceholder title="Reports" />} />

              </Route>
            </Route>

            <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard/admin" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
