import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import { AuthProvider, RequireAuth } from "./contexts/AuthContext";

// Views
import Login from "./views/Login";
import Signup from "./views/Signup";
import Loan from "./views/Loans";
import CreateLoan from "./views/CreateLoan";
import LoanDetails from "./views/LoanDetails";
import EditLoan from "./views/EditLoan";
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
        path: "/signup",
        element: <Signup />,
      },
      {
        element: <RequireAuth />,
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
