module.exports = (sequelize, Sequelize) => {
    return sequelize.define("role", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            value: ['User', 'Admin','user', 'admin'],
            validate: {
                isIn: {
                    args: [['User', 'Admin', 'user', 'admin']],
                    msg: "Role must be User or Admin"
                }
            }
        }

    });
};