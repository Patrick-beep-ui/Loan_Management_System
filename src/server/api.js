import express from "express";

import "./models/associations.js";

import UserRouter from "./routes/userRoutes.js";
import RoleRouter from "./routes/roleRoutes.js";
import AuthRouter from "./routes/authRoutes.js";

const api = express.Router({ mergeParams: true });

api.use("/users", UserRouter); // /api/users
api.use("/roles", RoleRouter); // /api/roles
api.use("/auth", AuthRouter); // /api/auth

export default api;
