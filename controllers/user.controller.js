const ggdrive = require("../services/google.clound/index");
//[GET] /user/upload-project
const uploadProject = async (req, res) => {
    const file = req.file
    await ggdrive.uploadImageFile({ image: file })
    // if (!req.user) {
    //     return res.redirect("/login")
    // }
    return res.send(req.file.path)
}

module.exports = { uploadProject }