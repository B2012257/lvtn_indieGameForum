module.exports = (sequelize, Sequelize) => {
    return sequelize.define("project", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        short_description: {
            type: Sequelize.STRING,
            defaultValue: ''
        },
        long_description: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: ''
        },
        isPublic: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        trailer: {
            type: Sequelize.STRING,
            defaultValue: ''

        },
        cover_image: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'default.png'
        },
        price: {
            type: Sequelize.DECIMAL(10, 0),
            allowNull: false,
            defaultValue: 0.00
        },
        project_folder_id: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: ' '
        },
        releaseStatus: {
            type: Sequelize.ENUM,
            values: ['developing', 'ready'],
            //allowNull: false
        }

    }, {
        paranoid: true
    });
};