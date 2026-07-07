import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home           from '../pages/Home';
import UserManagement from '../pages/admin/UserManagement';


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"element={<Home />} />

        <Route path="/admin/users" element={<UserManagement />} />

      </Routes>
    </BrowserRouter>
  );
}
