const db = require("../models/index")
const drive = require("../services/google.clound/index")

//[POST] /api/v1/upload-cover-image
const ggdrive = require('../services/google.clound/index')

let folderIdPublic;
let project_name
const uploadImage = async (req, res) => {
    // Tạo thư mục trên google drive với tên dự án
    // Upload ảnh cover vào thư mục vừa tạo
    // Trả về link ảnh
    project_name = req.body.pj_name
    //tạo thư mục dự án trên DRIVE
    folderIdPublic = await drive.createFolder({ name: project_name })

    const file = req.file
    //Nếu tạo thành công
    if (folderIdPublic) {
        //Lưu vào db
        await db.project.create({
            name: project_name,
            project_folder_id: folderIdPublic,
            userId: req.session?.user?.id ?? req.user?.id
        })
            .then(async (row) => {
                if (row) {
                    //Lưu project thành công thì lưu ảnh cover
                    if (file) { //Kiểm tra file tồn tại
                        let imageRes = await ggdrive.uploadImageFile({
                            image: file,
                            parent: folderIdPublic
                        })
                        //Lấy đường dẫn ảnh
                        let webViewLink = imageRes.data.webViewLink

                        //Xong lưu url ảnh vào db
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
                    } else {
                        res.json({ status: 400, message: "Upload file failed! No such file to upload" })
                    }

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
    let urlResponse = []

    if (files && files.length > 0) {
        //Kiểm tra version, Lưu version mới sau đó lưu dơnload link vào db
        console.log(req.body)
        for (const file of files) {
            let fileResponse = await ggdrive.uploadCompressedFile({
                file: file,
                shareToUser: 'user',
                shareTo: req.session?.user?.email ?? req.user?.email,
                parent: folderIdPublic
            })
            urlResponse.push(fileResponse)

        }
    }
}
module.exports = {
    uploadImage,
    uploadImages,
    uploadProject
}