const db = require("../models/index")
const drive = require("../services/google.clound/index")

//[POST] /

const uploadImages = (req, res) => {

    return res.render("index", {
        user: req.user || req.session.user,
        title: "Trang chủ",
        header: true,
        footer: false,
        isHomeActive: true
    })
}
const uploadProject = (req, res) => {   }

module.exports = {
    uploadImages,
    uploadProject
}