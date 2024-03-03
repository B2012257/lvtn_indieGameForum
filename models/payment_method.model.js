module.exports = (sequelize, Sequelize) => {
    return sequelize.define("payment_method", {
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