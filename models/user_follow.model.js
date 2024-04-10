module.exports = (sequelize, Sequelize) => {
    return sequelize.define("user_follow", {
        userId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        projectId: {
            type: Sequelize.STRING,
            references: {
                model: 'projects',
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