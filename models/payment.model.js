module.exports = (sequelize, Sequelize) => {
    return sequelize.define("payment", {
        userId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        transactionId: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "id"
        }
        ,
        projectId: {
            type: Sequelize.STRING,
            references: {
                model: 'projects',
                key: 'id'
            }
        },
        status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['Success', 'Failed']
        },
        messageStatus: {
            type: Sequelize.STRING,
            allowNull: true
        },
        dateOfPayment: {
            type: Sequelize.DATE,
            allowNull: false
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        lastPrice: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        createdAt: {
            type: Sequelize.DATEONLY, // Sử dụng kiểu dữ liệu DATEONLY
            allowNull: false,
            defaultValue: Sequelize.NOW // Có thể cần thêm giá trị mặc định nếu cần
        }
    },
        {
            paranoid: true,
        }
    );
};