import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import App from "./App";
import {
  AuthProvider,
  RequireAdmin,
  RequireAuth,
  RequireLender,
} from "./contexts/AuthContext";
import AdminLayout from "./layouts/AdminLayout";
import LenderLayout from "./layouts/LenderLayout";

// Views
import Login from "./views/Login";
import ChangePassword from "./views/ChangePassword";
import Loan from "./views/Loans";
import CreateLoan from "./views/CreateLoan";
import LoanDetails from "./views/LoanDetails";
import EditLoan from "./views/EditLoan";
import Payments from "./views/Payments";
import Stakeholders from "./views/Stakeholders";
import AdminDashboard from "./views/admin/AdminDashboard";
import AdminUsers from "./views/admin/AdminUsers";
import AdminStakeholders from "./views/admin/AdminStakeholders";
import AdminStakeholderProfile from "./views/admin/AdminStakeholderProfile";
import AdminLoans from "./views/admin/AdminLoans";
import AdminPayments from "./views/admin/AdminPayments";
import Test from "./Test";

const router = createBrowserRouter([
  {
    element: <AuthProvider />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "/change-password",
            element: <ChangePassword />,
          },
          {
            element: <LenderLayout />,
            children: [
              {
                path: "/loans",
                element: <Loan />,
              },
              {
                path: "/create-loan",
                element: <CreateLoan />,
              },
              {
                path: "/loans/:id",
                element: <LoanDetails />,
              },
              {
                path: "/loans/:id/edit",
                element: <EditLoan />,
              },
              {
                element: <RequireLender />,
                children: [
                  {
                    path: "/payments",
                    element: <Payments />,
                  },
                ],
              },
              {
                element: (
                  <RequireLender adminRedirect="/admin/stakeholders" />
                ),
                children: [
                  {
                    path: "/stakeholders",
                    element: <Stakeholders />,
                  },
                ],
              },
            ],
          },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: "/admin",
                element: <AdminLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="/admin/dashboard" replace />,
                  },
                  { path: "dashboard", element: <AdminDashboard /> },
                  { path: "users", element: <AdminUsers /> },
                  { path: "stakeholders", element: <AdminStakeholders /> },
                  {
                    path: "stakeholders/:id",
                    element: <AdminStakeholderProfile />,
                  },
                  { path: "loans", element: <AdminLoans /> },
                  { path: "payments", element: <AdminPayments /> },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "/test",
        element: <Test />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
