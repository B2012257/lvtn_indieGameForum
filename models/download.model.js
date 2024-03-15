module.exports = (sequelize, Sequelize) => {
    return sequelize.define("download", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        platform: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['Android', 'IOS', 'windows', 'Mac OS', 'Linux (RPM-based)', 'Linux (Debian-based)']
        },
        link: {
            type: Sequelize.STRING,
            allowNull: false
        },

    });
}; // end of module.exports
