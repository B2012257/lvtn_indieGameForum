module.exports = (sequelize, Sequelize) => {
    return sequelize.define("project", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        short_description: {
            type: Sequelize.STRING,
        },
        long_description: {
            type: Sequelize.STRING,
            allowNull: false

        },
        isPublic: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        trailer: {
            type: Sequelize.STRING
        },
        cover_image: {
            type: Sequelize.STRING,
            allowNull: false

        },
        price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        project_folder_id: {
            type: Sequelize.STRING,
            allowNull: false

        },
        releaseStatus: {
            type: Sequelize.ENUM,
            values: ['developing', 'ready'],
            allowNull: false
        }

    });
};