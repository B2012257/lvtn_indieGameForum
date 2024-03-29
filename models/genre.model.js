const SequelizeSlugify = require('sequelize-slugify');
module.exports = (sequelize, Sequelize) => {
    let genre = sequelize.define("genre", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 'Không có mô tả'
        },
        slug: {
            type: Sequelize.STRING,
            unique: true
        }

    });
    SequelizeSlugify.slugifyModel(genre, {
        source: ['name'],
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
    return genre;
};