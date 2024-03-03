module.exports = (sequelize, Sequelize) => {
    return sequelize.define("classification", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        }

    });
};