import { BrowserRouter, Routes, Route } from "react-router-dom";
import Live2DAssistant from "../components/Live2DAssistant";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Menu from "../pages/Menu";
import Cart from "../pages/Cart";
import Profile from "../pages/Profile";
import MyOrders from "../pages/MyOrders";
import Feedback from "../pages/Feedback";

import AdminDashboard from "../pages/AdminDashboard";
import AdminUsers from "../pages/AdminUsers";
import AdminVendors from "../pages/AdminVendors";
import AdminMenuReview from "../pages/AdminMenuReview";
import AdminMenuManage from "../pages/AdminMenuManage";
import AdminOrders from "../pages/AdminOrders";
import AdminFeedback from "../pages/AdminFeedback";

import VendorDashboard from "../pages/VendorDashboard";
import VendorItems from "../pages/VendorItems";
import VendorOrders from "../pages/VendorOrders";
import VendorAnalytics from "../pages/VendorAnalytics";
import VendorFeedback from "../pages/VendorFeedback";
import VendorProfile from "../pages/VendorProfile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleRoute roles={["admin"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RoleRoute roles={["admin"]}>
              <AdminUsers />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/vendors"
          element={
            <RoleRoute roles={["admin"]}>
              <AdminVendors />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/menu-review"
          element={
            <RoleRoute roles={["admin"]}>
              <AdminMenuReview />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/menu"
          element={
            <RoleRoute roles={["admin"]}>
              <AdminMenuManage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <RoleRoute roles={["admin"]}>
              <AdminOrders />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/feedback"
          element={
            <RoleRoute roles={["admin"]}>
              <AdminFeedback />
            </RoleRoute>
          }
        />

        <Route
          path="/vendor"
          element={
            <RoleRoute roles={["vendor"]}>
              <VendorDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/vendor/items"
          element={
            <RoleRoute roles={["vendor"]}>
              <VendorItems />
            </RoleRoute>
          }
        />

        <Route
          path="/vendor/orders"
          element={
            <RoleRoute roles={["vendor"]}>
              <VendorOrders />
            </RoleRoute>
          }
        />

        <Route
          path="/vendor/analytics"
          element={
            <RoleRoute roles={["vendor"]}>
              <VendorAnalytics />
            </RoleRoute>
          }
        />

        <Route
          path="/vendor/feedback"
          element={
            <RoleRoute roles={["vendor"]}>
              <VendorFeedback />
            </RoleRoute>
          }
        />

        <Route
          path="/vendor/profile"
          element={
            <RoleRoute roles={["vendor"]}>
              <VendorProfile />
            </RoleRoute>
          }
        />
      </Routes>
      <Live2DAssistant />
    </BrowserRouter>
  );
}