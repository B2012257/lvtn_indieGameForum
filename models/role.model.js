module.exports = (sequelize, Sequelize) => {
    return sequelize.define("role", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['User', 'Admin']
        }

    });
};