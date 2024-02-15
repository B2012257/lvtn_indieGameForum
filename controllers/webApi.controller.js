const db = require("../models/index")
const drive = require("../services/google.clound/index")

//[POST] /api/v1/upload-cover-image
const ggdrive = require('../services/google.clound/index')
const uploadImages = async (req, res) => {
    // Tạo thư mục trên google drive với tên dự án
    // Upload ảnh vào thư mục vừa tạo
    // Trả về link ảnh
    const file = req.file
    if (file) {
        return res.json(
            {
                ...await ggdrive.uploadImageFile({ image: file }),
                dataProject: req.body
            })

    } else {
        res.json({ status: 400, message: "Upload file failed! No such file to upload" })
    }
    // return res.json(file)
    // if (!req.user) {
    //     return res.redirect("/login")
    // }
}
//Api tải lên file dự án vào drive
const uploadProject = (req, res) => { }

module.exports = {
    uploadImages,
    uploadProject
}