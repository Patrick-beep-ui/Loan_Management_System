import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";

// Views
import Login from "./views/Login";
import Signup from "./views/Signup";
import Loan from "./views/Loans";
import CreateLoan from "./views/CreateLoan";
import Test from "./Test";

const router = createBrowserRouter([
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
    path: "/loans",
    element: <Loan />,
  },
  {
    path: "/create-loan",
    element: <CreateLoan />,
  },
  {
    path: "/test",
    element: <Test />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
