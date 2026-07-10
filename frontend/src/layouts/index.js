// Thin re-export layer to satisfy the project's required top-level
// `layouts/` folder. The actual layout components live alongside the
// rest of the UI in `components/layout/`, so related components
// (Navbar, Sidebar, Footer) aren't split across two parallel trees.
export { default as PublicLayout } from '../components/layout/PublicLayout';
export { default as DashboardLayout } from '../components/layout/DashboardLayout';
