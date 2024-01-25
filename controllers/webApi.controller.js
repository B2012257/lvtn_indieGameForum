const db = require("../models/index")
const drive = require("../services/google.clound/index")

//[POST] /

const uploadImages = (req, res) => {

    const { name, description, images } = req.body
    const { id } = req.params
    const project = { name, description, images, id }
    const { files } = req

    if (files.length > 0) {
        const images = files.map((file) => {
            return {
                name: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size,
            }
        })
        project.images = images
    }


}
const uploadProject = (req, res) => { }

module.exports = {
    uploadImages,
    uploadProject
}