const ggdrive = require("../services/google.clound/index");
const api = require("./webApi.controller")
const drive = require("../services/google.clound/index")

//[POST] /user/upload-project
const uploadProject = async (req, res) => {

    // if (!req.user) {
    //     return res.redirect("/login")
    // }
    console.log(req.body)
    res.json(req.body)
}

module.exports = { uploadProject }