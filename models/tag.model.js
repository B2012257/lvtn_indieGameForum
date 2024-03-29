const SequelizeSlugify = require('sequelize-slugify');
module.exports = (sequelize, Sequelize) => {
    let tag = sequelize.define("tag", {
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
            defaultValue: ""
        }, slug: {
            type: Sequelize.STRING,
            unique: true
        }

    });
    SequelizeSlugify.slugifyModel(tag, {
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
    return tag;
};