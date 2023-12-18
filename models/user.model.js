module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        username: {
            type: Sequelize.STRING(10)
        },
        password: {
            type: Sequelize.STRING
        }

    });

    return User;
};