module.exports = (sequelize, Sequelize) => {
    return sequelize.define("genre", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 'Không có mô tả'
        }

    });
};