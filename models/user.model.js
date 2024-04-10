module.exports = (sequelize, Sequelize) => {
    return sequelize.define("user", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,

        },
        username: {
            type: Sequelize.STRING(10),
            defaultValue: ""
        },
        password: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        googleId: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        email: {
            type: Sequelize.STRING,
            defaultValue: "",
            unique: true
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        avatarUrl: {
            type: Sequelize.STRING,
            defaultValue: "https://avatars.githubusercontent.com/u/98681?v=4",
            set(webViewLink) {
                //webViewLink = "https://drive.google.com/uc?id="
                //https://drive.google.com/file/d/1-SUK6uIbeJuKBYI6tZFOSWY8qzoArhgC/view?usp=drivesdk
                const url = webViewLink;
                console.log("URL:", url);
                if (url.includes("/file/d/")) {
                    const parts = url.split("/file/d/");
                    if (parts.length === 2) {
                        const fileId = parts[1].split("/")[0];
                        console.log("File ID:", fileId);
                        const templateViewImg = `https://lh3.googleusercontent.com/d/${fileId}`
                        console.log("Lưu trên");

                        this.setDataValue('avatarUrl', templateViewImg);

                    } else {
                        console.log("Không tìm thấy File ID.");
                        this.setDataValue('avatarUrl', "templateViewImg");
                    }
                }
                else {
                    console.log("Lưu dưới");
                    this.setDataValue('avatarUrl', url);
                }


            }
        },
    });
};