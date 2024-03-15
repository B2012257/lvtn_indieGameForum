const ggdrive = require("../services/google.clound/index");
const api = require("./webApi.controller")
const db = require("../models/index")
//[POST] /user/upload-project 
//FORM POST METHOD
const uploadProject = async (req, res) => {
    try {

        const projectInfo = req.body

        //Tìm project trong db thông qua folder_id và project_name để lưu các thông tin còn thiếu
        //Nếu không tìm thấy thì báo lỗi vui lòng thử lại và không lưu thông tin, trả về client
        if (projectInfo.folder_id && projectInfo.name) {
            const project_db = await db.project.findOne({
                where: {
                    project_folder_id: projectInfo.folder_id,
                    name: projectInfo.name
                }
            })
            if (project_db) {
                //Cập nhật số phiên bản
                let version = projectInfo.version
                db.version.update({
                    version_number: version
                }, {
                    where: {
                        projectId: project_db.id
                    }
                })
                    .then(row => {
                        console.log(row)
                    })
                    .catch(err => {
                        console.log(err)

                    })
                //Lưu thông tin vào db//
                //Kiểm tra tags nếu tìm thấy thì lưu id vào project_tag, còn không tìm thấy thì lưu mới vào db và lưu vào project_tag
                let project_tags = []
                project_tags = projectInfo.tags.split(",") // array of tags
                console.log(project_tags)
                project_tags.forEach(async projectTagName => {
                    await db.tag.findOrCreate({
                        where: {
                            name: projectTagName
                        },
                        defaults: {
                            name: projectTagName
                        },
                        attributes: ['id']
                    })
                        .then(async ([tagInstance, created]) => {
                            await project_db.addTag(tagInstance.id);
                            console.log('Tag đã được thêm vào project.');
                            // Kiểm tra nếu tag được tạo mới hoặc đã tồn tại
                            // if (created) {
                            //     console.log('Tag:', tagInstance.id);

                            //     // Kiểm tra xem project_db có phải là mô hình project không
                            //     // Sử dụng addTag để thêm tag vào project

                            // } else {
                            //     await project_db.addTag(tagInstance.id);
                            //     console.log('Tag đã được thêm vào project.');

                            // }
                        });
                });

                // Tìm kiếm genre dựa trên id
                let genreDb = await db.genre.findOne({
                    where: {
                        id: projectInfo.genre
                    }
                });
                // // Tìm kiếm classification dựa trên id
                let classificationDb = await db.classification.findOne({
                    where: {
                        id: projectInfo.classification
                    }
                });
                // Thêm genres vào project

                await project_db.setGenre(genreDb)
                // Thêm genres vào classification
                await project_db.setClassification(classificationDb)

                await db.project.update({
                    short_description: projectInfo.short_description,
                    long_description: projectInfo.long_description,
                    classificationId: projectInfo.classificationId,
                    genreId: projectInfo.genreId,
                    isPublic: projectInfo.isPublic,
                    trailer: projectInfo.trailer,
                    price: projectInfo.price,
                    releaseStatus: projectInfo.releaseStatus,
                    userId: req.session?.user?.id ?? req.user?.id
                }, {
                    where: {
                        id: project_db.id,
                    }
                })
                    .then(row => {
                        console.log(row)
                        res.redirect(`/user/project/${project_db.id}/edit`);

                    })
                    .catch(err => {
                        console.log(err)
                    })
            } else {
                res.json({
                    status: 400,
                    message: "Không tìm thấy dự án, vui lòng thử lại"
                })
            }

        }

    } catch (error) {
        console.log(error);
    }
}

module.exports = { uploadProject }