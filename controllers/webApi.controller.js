const db = require("../models/index")
const drive = require("../services/google.clound/index")
const { platform } = require('../configs/constraint')

const ggdrive = require('../services/google.clound/index')
const random4NumberUntil = require('../utils/random4Number')

let folderIdPublic;
let project_name_and_random
const uploadImage = async (req, res) => {
    // Tạo thư mục trên google drive với tên dự án
    // Upload ảnh cover vào thư mục vừa tạo
    console.log("vao 1")
    // Trả về link ảnh
    let project_name = req.body.pj_name
    project_name_and_random = project_name + random4NumberUntil()
    //tạo thư mục dự án trên DRIVE
    folderIdPublic = await drive.createFolder({
        name: project_name_and_random,
        // parents: process.env.PROJECT_FOLDER_ID_DRIVE,
        shareToUser: true,
        shareToEmail: req.session?.user?.email ?? req.user?.email
    })
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
                                res.json({
                                    folderIdPublic,
                                    status: 200, message: "Upload file success!",
                                    data: {
                                        imageUrl: imageRes.data,
                                    }
                                })
                            })
                            .catch(err => {
                                console.log(err);
                            })
                    } else {
                        res.json({ status: 400, message: "Upload file failed! No such file to upload", folderIdPublic })
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
    let projectDb = await db.project.findOne({
        where: {
            project_folder_id: folderIdPublic
        }
    })
    if (files && files.length > 0) {

        for (const file of files) {
            let fileResponse = await ggdrive.uploadImageFile({
                image: file,
                //shareTo: 'req.session?.user?.email ?? req.user?.email',

                parent: folderIdPublic
            })
            // Tạo một hình ảnh và luư vào db
            const image = await db.image.create({
                url: fileResponse.data.webViewLink,
                isCoverImage: false,
            });
            await projectDb.addImage(image)
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

const saveDescription = async (req, res) => {
    let projectId = req.body.projectId
    let newDescription = req.body.description
    try {
        await db.project.update(
            {
                long_description: newDescription
            },
            {
                where: {
                    id: projectId
                },
            }
        )
        res.json({ msg: "Lưu thành công!", status: 200 })

    } catch (error) {
        console.log(error);
        res.json({ msg: "Lưu không thành công! Vui lòng thử lại", status: 400 })

    }
}

//Api tải lên file dự án vào drive
const uploadProject = async (req, res) => {
    console.log("concack");
    //Lưu 1 version vào db,  sau đó lưu vào bảng Dowload link trò chơi
    let version = req.body.version

    const files = { ...req.files }
    console.log(files);
    let urlResponse = []
    const newArrayFiles = [];
    //Biến đổi để dễ code hơn
    for (const key in files) {
        if (files[key].length > 0) {
            newArrayFiles.push(files[key][0]);
        }
    }

    //Nếu có file
    if (files) {
        //Kiểm tra version, Lưu version mới sau đó lưu dơnload link vào db
        //Lấy ra id project
        let project = await db.project.findOne({
            where: {
                project_folder_id: folderIdPublic
            }
        })
        //Tạo 1 thử mục version
        let versionFolderId = await ggdrive.createFolder({
            name: version,
            parents: project.project_folder_id,
            // shareToUser: true,
            // shareToEmail: req.session?.user?.email ?? req.user?.email
        })
        let newVersion = await db.version.create({
            projectId: project.id,
            versionFolderId,
            version_number: version
        })

        for (const file of newArrayFiles) {
            let fileResponse = await ggdrive.uploadCompressedFile({
                file: file,
                shareToUser: true,
                shareTo: req.session?.user?.email ?? req.user?.email,
                parent: versionFolderId
            })
            //Tạo 1 dowload và lưu vào db
            await db.download.create({
                link: fileResponse.data.webViewLink,
                versionId: newVersion.id,
                platform: file.fieldname
            })
            urlResponse.push(fileResponse)

        }
        res.json({
            status: 200, msg: 'Success!', urlResponse
        })
    } else
        res.json({
            status: 400, msg: 'Bad request! At least 1 file project'
        })
}
const uploadImageFromCkEditor = async (req, res) => {

}
module.exports = {
    uploadImage,
    uploadImages,
    uploadProject,
    saveDescription,
    uploadImageFromCkEditor
}