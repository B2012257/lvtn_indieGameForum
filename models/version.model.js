module.exports = (sequelize, Sequelize) => {
    return sequelize.define("version", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        version_number: {
            type: Sequelize.STRING,
            allowNull: false

        },
        relase_date: {
            type: Sequelize.STRING(10),
            allowNull: false

        },
        install_guide: {
            type: Sequelize.STRING,
            defaultValue: ""
        }
    });
};