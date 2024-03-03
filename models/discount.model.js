module.exports = (sequelize, Sequelize) => {
    return sequelize.define("discount", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        startDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        endDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        discountValuePercent: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        }

    }, {
        paranoid: true
    });
};