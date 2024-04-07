const SequelizeSlugify = require('sequelize-slugify');
module.exports = (sequelize, Sequelize) => {
    let project = sequelize.define("project", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            defaultValue: 'New project'
        },
        short_description: {
            type: Sequelize.TEXT('medium'),
        },
        long_description: {
            type: Sequelize.TEXT('long'),
            allowNull: true,
            // defaultValue: "Default description"
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
            defaultValue: 0.00,
        },
        project_folder_id: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: ' '
        },
        releaseStatus: {
            type: Sequelize.ENUM,
            values: ['Đã phát hành', 'Đang phát triển'],
            //allowNull: false
        },
        slug: {
            type: Sequelize.STRING,
            unique: true
        },
        viewCount: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        likeCount: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }, createdAt: {
            type: Sequelize.DATEONLY, // Sử dụng kiểu dữ liệu DATEONLY
            allowNull: false,
            defaultValue: Sequelize.NOW // Có thể cần thêm giá trị mặc định nếu cần
        }

    }, {
        paranoid: true
    },
    );
    SequelizeSlugify.slugifyModel(project, {
        source: ['name', 'id'],
        overwrite: false,
        slugOptions: {
            lower: true,
            strict: true,
            separator: '-',
            lang: 'vi'
            , symbols: false
        },
        column: 'slug'
    })
    return project;
};