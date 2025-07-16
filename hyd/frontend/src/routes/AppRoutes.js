import { Routes, Route } from "react-router-dom";
import AdminHome from "../admin/AdminHome";
import EmployeeHome from "../employee/EmployeeHome";
import SuperAdminHome from "../superadmin/SuperAdminHome";

const currentUserRole = localStorage.getItem("role");  // or from context

const AppRoutes = () => (
  <Routes>
    <Route path="/admin" element={<AdminHome />} />
    <Route path="/employee" element={<EmployeeHome />} />
    <Route path="/superadmin" element={<SuperAdminHome />} />
  </Routes>
);

export default AppRoutes;
