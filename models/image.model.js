module.exports = (sequelize, Sequelize) => {
    return sequelize.define("image", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        url: {
            type: Sequelize.STRING,
            allowNull: false,
            set(webViewLink) {
                //webViewLink = "https://drive.google.com/uc?id="
                //https://drive.google.com/file/d/1-SUK6uIbeJuKBYI6tZFOSWY8qzoArhgC/view?usp=drivesdk
                const url = webViewLink;
                const parts = url.split("/file/d/");

                if (parts.length === 2) {
                    const fileId = parts[1].split("/")[0];
                    console.log("File ID:", fileId);
                    const templateViewImg = `https://lh3.googleusercontent.com/d/${fileId}`
                    this.setDataValue('url', templateViewImg);

                } else {
                    console.log("Không tìm thấy File ID.");
                    this.setDataValue('url', "templateViewImg");
                }

            }
        },
        isCoverImage: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }

    });
};