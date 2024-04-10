const db = require("../models/index")
const drive = require("../services/google.clound/index")
const { platform } = require('../configs/constraint')

const ggdrive = require('../services/google.clound/index')
const random4NumberUntil = require('../utils/random4Number')
const { where } = require("sequelize")
require('dotenv').config()
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
    try {
        folderIdPublic = await drive.createFolder({
            name: project_name_and_random,
            // parents: process.env.PROJECT_FOLDER_ID_DRIVE,
            shareToUser: true,
            shareToEmail: req.session?.user?.email ?? req.user?.email
        })
    } catch (error) {
        console.log(error);
        console.log("Hết hạn token google");
    }

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
const search = async (req, res) => {
    //Tìm kiếm dựa theo kết quả tìm kiếm, theo tên, thể loại và tags

    let search = req.query.q
    let projects = await db.project.findAll({
        where: {
            name: {
                [db.Sequelize.Op.like]: `%${search}%`
            }
        },
        include: [
            {
                model: db.image,
                where: {
                    isCoverImage: true
                }
            },
            db.genre, db.tag
        ]
    })
    res.json(projects)
}
const updateImage = async (req, res) => {
    let projcetId = req.body.projectId
    let hrefs = req.body.href ?? []// urls
    let type = req.body.type ?? "None" // type
    let file = req.files?.image

    let files = req.files?.images
    console.log("file", files);

    // files
    //Nếu có file ảnh mới màn hình mới
    let project = await db.project.findOne({
        where: {
            id: projcetId
        }
    })
    project = JSON.parse(JSON.stringify(project))
    if (files) {
        console.log(files);
        for (const file of files) {
            console.log(file);
            try {
                let fileResponse = await ggdrive.uploadImageFile({
                    image: file,
                    parent: project.project_folder_id
                })
                console.log(fileResponse);
                //Lưu ảnh mới vafo db
                console.log("Luuw anh man hinh moi");

                await db.image.create({
                    url: fileResponse.data.webViewLink,
                    projectId: project.id,
                    isCoverImage: false,
                    isCoverImageLarge: false
                })
            } catch (error) {
                console.log(error);
            }

        }
    }
    //Nếu có file ảnh mới

    if (file) {
        //Lấy folderId của dự án

        if (type === "coverImage") {

            let aFile = file[0] ?? null
            console.log(project.project_folder_id);
            //Đẩy nó lên gg drive
            if (aFile) {
                let fileResponse = await ggdrive.uploadImageFile({
                    image: aFile,
                    parent: project.project_folder_id
                })
                console.log(fileResponse);
                //Xoá ảnh cover hiện tại và lưu ảnh mới vào
                await db.image.destroy({
                    where: {
                        projectId: project.id,
                        isCoverImage: true,
                        isCoverImageLarge: false
                    }
                })
                //Lưu ảnh mới
                console.log("Luuw anh bia nho moi");

                await db.image.create({
                    url: fileResponse.data.webViewLink,
                    projectId: project.id,
                    isCoverImage: true,
                    isCoverImageLarge: false
                })
            }


        }
        if (type === "coverImageLarge") {
            let aFile = file[0] ?? null
            if (aFile) {
                try {
                    let fileResponse = await ggdrive.uploadImageFile({
                        image: aFile,
                        parent: project.project_folder_id
                    })
                    console.log(fileResponse);
                    //Xoá ảnh cover hiện tại và lưu ảnh mới vào

                    await db.image.destroy({
                        where: {
                            projectId: project.id,
                            isCoverImage: false,
                            isCoverImageLarge: true
                        }
                    })
                    //Lưu ảnh mới
                    console.log("Luuw anh bia lon moi");

                    await db.image.create({
                        url: fileResponse.data.webViewLink,
                        projectId: project.id,
                        isCoverImage: false,
                        isCoverImageLarge: true
                    })

                } catch (error) {
                    console.log(error);
                }
            }

        }

    }
    if (hrefs && hrefs.length !== 0) {
        //Nếu href là mảng thì nó là ảnh màn hình
        //kiểm tra hrefs có phải là mảng không

        if (typeof hrefs === 'object') {


            //Xoá tất cả ảnh màn hình cũ
            await db.image.destroy({
                where: {
                    projectId: projcetId,
                    isCoverImage: false,
                    isCoverImageLarge: false
                }
            })

            //Lưu ảnh mới
            for (const href of hrefs) {
                console.log(href);
                await db.image.create({
                    url: href,
                    projectId: projcetId,
                    isCoverImage: false,
                    isCoverImageLarge: false
                })
            }
        } else {
            //Nếu không phải thì nó là một url của 1 ảnh
            console.log(type);
            if (type === "coverImage") {
                //Xoá hết ảnh cũ
                //vào if tpye coverImage

                await db.image.destroy({
                    where: {
                        projectId: projcetId,
                        isCoverImage: true,
                        isCoverImageLarge: false
                    }
                })
                //Luư ảnh mới

                await db.image.create({
                    url: hrefs,
                    projectId: projcetId,
                    isCoverImage: true,
                    isCoverImageLarge: false
                })
            }
            if (type === "coverImageLarge") {
                //Xoá hết ảnh cũ
                //vào if tpye coverImageLarge
                await db.image.destroy({
                    where: {
                        projectId: projcetId,
                        isCoverImage: false,
                        isCoverImageLarge: true
                    }
                })
                //Lưu ảnh mới

                await db.image.create({
                    url: hrefs,
                    projectId: projcetId,
                    isCoverImage: false,
                    isCoverImageLarge: true
                })
            }

        }
    }
    res.json({ status: 200, msg: "Success!" })
}
const updateAvatar = async (req, res) => {
    let avatarFile = req.file
    console.log(avatarFile);
    try {
        //Upload lên gg drive
        let fileResponse = await ggdrive.uploadImageFile({
            image: avatarFile,
            parent: process.env.AVATAR_FOLDER_ID_DRIVE
        })
        //Lưu vào db
        await db.user.update({
            avatarUrl: fileResponse.data.webViewLink
        }, {
            where: {
                id: req.session?.user?.id ?? req.user?.id
            }
        })
        res.json({ status: 200, msg: "Cập nhật ảnh thành công!" })

    } catch (error) {
        console.log(error);
        res.json({ status: 400, msg: "Lỗi! Cập nhật ảnh thất bại" })

    }

}
module.exports = {
    uploadImage,
    uploadImages,
    uploadProject,
    saveDescription,
    uploadImageFromCkEditor,
    search,
    updateImage,
    updateAvatar
}