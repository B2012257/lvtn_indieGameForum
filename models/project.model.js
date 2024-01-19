module.exports = (sequelize, Sequelize) => {
    return sequelize.define("project", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        }

    });
};