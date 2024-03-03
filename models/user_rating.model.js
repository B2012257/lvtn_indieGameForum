
module.exports = (sequelize, Sequelize) => {
    return sequelize.define("user_rating", {

        userId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        projectId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'projects',
                key: 'id'
            }
        },
        contentRate: {
            type: Sequelize.STRING,
            allowNull: true

        },
        numberStarRate: {
            type: Sequelize.INTEGER,
            allowNull: false,
            values: [1, 2, 3, 4, 5]
        }
    },
        {
            paranoid: true,
        });
}
// contentRate: {
//     type: Sequelize.STRING,

//         },
// numberStarRate: {
//     type: Sequelize.INTEGER,
//         }