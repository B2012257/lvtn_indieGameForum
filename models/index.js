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
    },
    logging: false,

});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize)
db.role = require("./role.model")(sequelize, Sequelize)
db.project = require("./project.model.js")(sequelize, Sequelize)
db.tag = require("./tag.model.js")(sequelize, Sequelize)
db.classification = require("./classification.model.js")(sequelize, Sequelize)
db.version = require("./version.model.js")(sequelize, Sequelize)
db.comment = require("./comment.model.js")(sequelize, Sequelize)
db.discount = require("./discount.model.js")(sequelize, Sequelize)
db.download = require("./download.model.js")(sequelize, Sequelize)
db.genre = require("./genre.model.js")(sequelize, Sequelize)
db.payment_method = require("./payment_method.model.js")(sequelize, Sequelize)
db.payment = require("./payment.model.js")(sequelize, Sequelize)
db.post = require("./post.model.js")(sequelize, Sequelize)
db.user_rating = require("./user_rating.model.js")(sequelize, Sequelize)
db.image = require("./image.model.js")(sequelize, Sequelize)
db.user_follow = require("./user_follow.model.js")(sequelize, Sequelize)
db.post_tag = require("./post_tag.model.js")(sequelize, Sequelize)
// Define relationships role and user
db.role.hasMany(db.user) // 1 -> N
db.user.belongsTo(db.role); // 1 -> 1

// Define relationships user and project
db.user.hasMany(db.project) // 1 -> N
db.project.belongsTo(db.user); // 1 -> 1

//Define relationships project and version
db.project.hasMany(db.version) // 1 -> N
db.version.belongsTo(db.project); // 1 -> 1

//Define relationships project and version
db.classification.hasMany(db.project) // 1 -> N;
db.project.belongsTo(db.classification);

//Define relationships project and tag
db.project.belongsToMany(db.tag, { through: "project_tag" })
db.tag.belongsToMany(db.project, { through: "project_tag" });

//Define relationships project and classification
db.classification.hasMany(db.project) // 1 -> N   
db.project.belongsTo(db.classification); // 1 -> 1

//Define relationships project and genre
db.genre.hasMany(db.project) // 1 -> N   
db.project.belongsTo(db.genre); // 1 -> 1

//Define relationships project and image
db.project.hasMany(db.image) // 1 -> N   
db.image.belongsTo(db.project); // 1 -> 1

// db.project.hasMany(db.post) // 1 -> N
// db.post.belongsTo(db.project); // 1 -> 1


//Define relationships version and post for devlog
// 1 ver có 1 post devlog
db.version.hasOne(db.post) // 1 -> 1
db.post.belongsTo(db.version); // 1 -> 1

//Define relationships project and discount
db.project.hasMany(db.discount) // 1 -> N   
db.discount.belongsTo(db.project); // 1 -> 1

//Define relationships project and post for doing comment
db.user.hasMany(db.comment) // 1 -> N   
db.comment.belongsTo(db.user); // 1 -> 1

//Define relationships comment and comment for reply comment
db.comment.hasMany(db.comment, { foreignKey: 'replyParentCommentId' }) // 1 -> N   
db.comment.belongsTo(db.comment, { foreignKey: 'replyParentCommentId' }); // 1 -> 1

//Define relationships comment and post for save comment
db.post.hasMany(db.comment) // 1 -> N   
db.comment.belongsTo(db.post); // 1 -> 1

//Define relationships user and post for posting
db.user.hasMany(db.post) // 1 -> N   
db.post.belongsTo(db.user); // 1 -> 1

//Define relationships version and download for uploading download file
db.version.hasMany(db.download) // 1 -> N   
db.download.belongsTo(db.version); // 1 -> 1

//Define relationships payment and payment_method for paying
db.payment_method.hasMany(db.payment) // 1 -> N   
db.payment.belongsTo(db.payment_method); // 1 -> 1

//Define relationships project and user for rating
db.user.belongsToMany(db.project, { through: db.user_rating });
db.project.belongsToMany(db.user, { through: db.user_rating });

//Define relationships project and user for payment
db.user.belongsToMany(db.project, { through: db.payment });
db.project.belongsToMany(db.user, { through: db.payment });

//Define relationships project and user for following
db.user.belongsToMany(db.project, { through: db.user_follow });
db.project.belongsToMany(db.user, { through: db.user_follow });

//Define relationships project and tag 
db.tag.belongsToMany(db.project, { through: 'project_tag' });
db.project.belongsToMany(db.tag, { through: 'project_tag' });

//Define relationships post and tag
db.tag.belongsToMany(db.post, { through: db.post_tag });
db.post.belongsToMany(db.tag, { through: db.post_tag });

module.exports = db;
