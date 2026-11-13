import express from "express";

import Role from "./models/Role.js";
import User from "./models/User.js";
import Stakeholder from "./models/Stakeholder.js";

import bcrypt from "bcryptjs";
import passport from "passport";

import "./models/associations.js";

const api = express.Router({mergeParams: true});

api.get("/roles", async (req, res) => {
    try {
        const roles = await Role.findAll(); // select * from roles
        res.status(200).json(roles);
    }
    catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

api.get("/users", async (req, res) => {
    try {
        const users = await User.findAll({
                include: [
                    {
                        model: Stakeholder,
                        attributes: ["stakeholder_id", "first_name", "last_name"]
                    },
                    {
                        model: Role,
                        attributes: ["role_id", "role_name"]
                    }
                ],
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


api.post("/signup", async (req, res) => {
    try {
        const { email, password, role_id, stakeholder_id } = req.body;
        console.log("Signup request body:", req.body);
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password_hash: hashedPassword,
            role_id,
            stakeholder_id
        });
        res.status(201).json({ message: "User created successfully", user });
    }
    catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

export default api;