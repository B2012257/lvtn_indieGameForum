module.exports = (sequelize, Sequelize) => {
    return sequelize.define("post", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false

        },
        content: {
            type: Sequelize.STRING,
            allowNull: false
        },
        viewCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        replyCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        likeCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_public: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        postType: {
            type: Sequelize.STRING,
            values: ['article', 'question', 'devlog'],
        }

    }, {
        paranoid: true
    });
};