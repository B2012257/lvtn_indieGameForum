module.exports = (sequelize, Sequelize) => {
    return sequelize.define("comment", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        content: {
            type: Sequelize.STRING,
            allowNull: false
        }

    }, {
        paranoid: true
    });
};