module.exports = (sequelize, Sequelize) => {
    return sequelize.define("post_tag", {
        postId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'posts',
                key: 'id'
            }
        },
        tagId: {
            type: Sequelize.STRING,
            references: {
                model: 'tags',
                key: 'id'
            }
        },

        createdAt: {
            type: Sequelize.DATEONLY, // Sử dụng kiểu dữ liệu DATEONLY
            allowNull: false,
            defaultValue: Sequelize.NOW // Có thể cần thêm giá trị mặc định nếu cần
        }
    },
    );
};