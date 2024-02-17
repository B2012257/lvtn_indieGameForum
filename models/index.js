const dbConfig = require("../configs/db.js");

const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize)
db.role = require("./role.model")(sequelize, Sequelize)
db.project = require("./project.model.js")(sequelize, Sequelize)
db.tag = require("./tag.model.js")(sequelize, Sequelize)
db.category = require("./category.model.js")(sequelize, Sequelize)
db.version = require("./version.model.js")(sequelize, Sequelize)

// Define relationships role and user
db.role.hasMany(db.user) // 1 -> N
db.user.belongsTo(db.role); // 1 -> 1

// Define relationships user and project
db.user.hasMany(db.project) // 1 -> N
db.project.belongsTo(db.user); // 1 -> 1

//Define relationships project and version
db.project.hasMany(db.version) // 1 -> N
db.version.belongsTo(db.project); // 1 -> 1

//Define relationships project and tag
db.project.belongsToMany(db.tag, { through: "project_tag" })
db.tag.belongsToMany(db.project, { through: "project_tag" });

//Define relationships project and category
db.category.hasMany(db.project) // 1 -> N   
db.project.belongsTo(db.category); // 1 -> 1

module.exports = db;
