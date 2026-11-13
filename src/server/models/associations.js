import Stakeholder from "./Stakeholder.js";
import User from "./User.js";
import Role from "./Role.js";

// User - Stakeholder
User.belongsTo(Stakeholder, { foreignKey: "stakeholder_id" });
Stakeholder.hasMany(User, { foreignKey: "stakeholder_id" });

// User - Role
User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

