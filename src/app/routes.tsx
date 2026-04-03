import { createBrowserRouter, Navigate } from "react-router";

// Layouts
import PatientLayout from "./components/PatientLayout";
import StaffLayout from "./components/StaffLayout";

// Pages
import LandingPage from "./components/LandingPage";
import PatientLogin from "./components/PatientLogin";
import PatientDashboard from "./components/PatientDashboard";
import JoinQueue from "./components/JoinQueue";
import LiveQueueMonitor from "./components/LiveQueueMonitor";
import MedicalHistory from "./components/MedicalHistory";
import PatientSettings from "./components/PatientSettings";
import StaffLogin from "./components/StaffLogin";
import StaffDashboard from "./components/StaffDashboard";
import WalkInRegistration from "./components/WalkInRegistration";
import AdminDashboard from "./components/AdminDashboard";

// PLACEHOLDER: Add route guards (PrivateRoute components) to protect
// /patient/*, /staff/*, /admin/* routes using JWT token validation
// Replace direct component renders with <PrivateRoute role="patient"> wrappers

export const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/patient/login",
    element: <PatientLogin />,
  },
  {
    path: "/staff/login",
    element: <StaffLogin />,
  },

  // Patient Portal (Protected)
  {
    path: "/patient",
    element: <PatientLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/patient/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <PatientDashboard />,
      },
      {
        path: "queue/join",
        element: <JoinQueue />,
      },
      {
        path: "queue/monitor",
        element: <LiveQueueMonitor />,
      },
      {
        path: "medical-history",
        element: <MedicalHistory />,
      },
      {
        path: "settings",
        element: <PatientSettings />,
      },
    ],
  },

  // Staff Portal (Protected)
  {
    path: "/staff",
    element: <StaffLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/staff/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <StaffDashboard />,
      },
      {
        path: "walkin",
        element: <WalkInRegistration />,
      },
      {
        path: "queue",
        // PLACEHOLDER: Add full queue management page (filters, search, bulk actions)
        element: <StaffDashboard />,
      },
      {
        path: "records",
        // PLACEHOLDER: Add full patient records management page
        element: <MedicalHistory />,
      },
      {
        path: "settings",
        // PLACEHOLDER: Add staff-specific settings page
        element: <PatientSettings />,
      },
    ],
  },

  // Admin Portal (Protected — Admin role required)
  {
    path: "/admin",
    element: <StaffLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "accounts",
        element: <AdminDashboard />,
      },
      {
        path: "queue-controls",
        element: <AdminDashboard />,
      },
    ],
  },

  // Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
