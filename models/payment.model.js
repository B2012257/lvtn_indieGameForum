module.exports = (sequelize, Sequelize) => {
    return sequelize.define("payment", {
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
            type: Sequelize.INTEGER,
            allowNull: false
        },
        lastPrice: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
    },
        {
            paranoid: true,
        }
    );
};