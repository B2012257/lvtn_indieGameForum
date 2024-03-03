module.exports = (sequelize, Sequelize) => {
    return sequelize.define("download", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        platform: {
            type: Sequelize.STRING,
            allowNull: false,
            values: ['android', 'ios', 'web', 'windows', 'macos', 'linux']
        },
        link: {
            type: Sequelize.STRING,
            allowNull: false
        },

    });
};