module.exports = (sequelize, Sequelize) => {
    return sequelize.define("version", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        version_number: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: '1.0'
        },
        release_Date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: new Date()
        },
        install_guide: {
            type: Sequelize.STRING,
            defaultValue: ""
        }
    });
};