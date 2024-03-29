const SequelizeSlugify = require('sequelize-slugify');
module.exports = (sequelize, Sequelize) => {
    let classification = sequelize.define("classification", {
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
        },
        slug: {
            type: Sequelize.STRING,
            unique: true
        }

    });
    SequelizeSlugify.slugifyModel(classification, {
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
    return classification;
};