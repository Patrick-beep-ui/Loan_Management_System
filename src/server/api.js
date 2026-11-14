import express from "express";

import "./models/associations.js";

import { checkAuth } from "./middlewares/checkAuth.js";
import AuthRouter from "./routes/authRoutes.js";
import UserRouter from "./routes/userRoutes.js";
import RoleRouter from "./routes/roleRoutes.js";

const api = express.Router({ mergeParams: true });

api.use("/auth", AuthRouter); // public: signup, login

api.use(checkAuth); // every route registered below requires a valid token

api.use("/users", UserRouter); // /api/users
api.use("/roles", RoleRouter); // /api/roles

export default api;
