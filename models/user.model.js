module.exports = (sequelize, Sequelize) => {
    return sequelize.define("user", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        username: {
            type: Sequelize.STRING(10),
            defaultValue: ""
        },
        password: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        googleId: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        email: {
            type: Sequelize.STRING,
            defaultValue: ""
        }

    });
};