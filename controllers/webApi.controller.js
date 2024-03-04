const db = require("../models/index")
const drive = require("../services/google.clound/index")

//[POST] /api/v1/upload-cover-image
const ggdrive = require('../services/google.clound/index')

let folderIdPublic;
const uploadImage = async (req, res) => {
    // Tạo thư mục trên google drive với tên dự án
    // Upload ảnh cover vào thư mục vừa tạo
    // Trả về link ảnh
    let project_name = req.body.pj_name
    folderIdPublic = await drive.createFolder({ name: project_name })

    const file = req.file
    if (file && folderIdPublic) {
        let imageRes = await ggdrive.uploadImageFile({
            image: file,

            parent: folderIdPublic
        })
        let webViewLink = imageRes.data.webViewLink
        await db.project.create({
            name: project_name,
            project_folder_id: folderIdPublic,
            userId: req.session?.user?.id ?? req.user?.id
        })
            .then(row => {
                if (row) {
                    db.image.create({
                        url: webViewLink,
                        projectId: row.id,
                        isCoverImage: true
                    })
                        .then(row => {
                            console.log(row);
                            res.json({ status: 200, message: "Upload file success!", data: imageRes.data })
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }
            })
            .catch(err => { console.log(err); })
    } else {
        res.json({ status: 400, message: "Upload file failed! No such file to upload" })
    }
    // return res.json(file)
    // if (!req.user) {
    //     return res.redirect("/login")
    // }
}

const uploadImages = async (req, res) => {
    const files = req.files
    let urlResponse = []
    if (files && files.length > 0) {

        for (const file of files) {
            let fileResponse = await ggdrive.uploadImageFile({
                image: file,
                //shareTo: 'req.session?.user?.email ?? req.user?.email',

                parent: folderIdPublic
            })
            urlResponse.push(fileResponse)
        }
        res.json({
            status: 200, msg: 'Success!', urlResponse
        })
    } else {
        res.json({
            status: 400, msg: 'Bad request! At least 1 photo'
        })
    }
}

const createProjectInDb = async () => {

}

//Api tải lên file dự án vào drive
const uploadProject = async (req, res) => {
    const files = req.files
    console.log(files)
    let urlResponse = []
    if (files && files.length > 0) {

        for (const file of files) {
            let fileResponse = await ggdrive.uploadCompressedFile({
                file: file,
                shareTo: req.session?.user?.email ?? req.user?.email,
                parent: folderIdPublic
            })
            urlResponse.push(fileResponse)
            let data = await ggdrive.uploadImageFile({
                image: file,
                shareTo: req.session?.user?.email ?? req.user?.email,
                parent: folderIdPublic
            })
            const newproject = await db.project.create({
                name: project_name,
                projectFolderId: folderIdPublic,
                userId: req.session?.user?.id ?? req.user?.id
            })
                .then(row => {
                    console.log(row);
                })
                .catch(err => { console.log(err); })
        }
        res.json({
            status: 200, msg: 'Success!', urlResponse
        })
    } else {
        res.json({
            status: 400, msg: 'Bad request! At least 1 photo'
        })
    }
}
module.exports = {
    uploadImage,
    uploadImages,
    uploadProject
}