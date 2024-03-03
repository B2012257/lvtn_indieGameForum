module.exports = (sequelize, Sequelize) => {
    return sequelize.define("image", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        url: {
            type: Sequelize.STRING,
            allowNull: false
        },
        isCoverImage: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }

    });
};