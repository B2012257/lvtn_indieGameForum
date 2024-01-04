module.exports = (sequelize, Sequelize) => {
    return sequelize.define("role", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            validate: {
                isIn: {
                    args: [['User', 'Admin']],
                    msg: "Role must be User or Admin"
                }
            }
        }

    });
};