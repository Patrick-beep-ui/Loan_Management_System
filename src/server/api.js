import express from "express";

import "./models/associations.js";

import { checkAuth } from "./middlewares/checkAuth.js";
import { requirePasswordChanged } from "./middlewares/requirePasswordChanged.js";
import AdminRouter from "./routes/adminRoutes.js";
import AuthRouter from "./routes/authRoutes.js";
import UserRouter from "./routes/userRoutes.js";
import RoleRouter from "./routes/roleRoutes.js";
import StakeholderRouter from "./routes/stakeholderRoutes.js";
import LoanRouter from "./routes/loanRoutes.js";
import PaymentRouter from "./routes/paymentRoutes.js";

const api = express.Router({ mergeParams: true });

api.use("/auth", AuthRouter); // public: login

api.use(checkAuth); // every route registered below requires a valid token
api.use(requirePasswordChanged); // accounts with a temporary password can only change it

api.use("/admin", AdminRouter);
api.use("/users", UserRouter); // /api/users
api.use("/roles", RoleRouter); // /api/roles
api.use("/stakeholders", StakeholderRouter); // /api/stakeholders
api.use("/loans", LoanRouter); // /api/loans
api.use("/payments", PaymentRouter);

export default api;
