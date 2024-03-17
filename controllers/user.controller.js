require('dotenv').config();

const ggdrive = require("../services/google.clound/index");
const api = require("./webApi.controller")
const db = require("../models/index")
const paypal = require('paypal-rest-sdk');
// Cấu hình PayPal
paypal.configure({
    'mode': process.env.PAYPAL_MODE, // hoặc 'live' nếu bạn sử dụng tài khoản PayPal thực tế
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});
//[POST] /user/upload-project 
//FORM POST METHOD
const uploadProject = async (req, res) => {
    try {

        const projectInfo = req.body
        console.log(JSON.stringify(projectInfo))
        //Tìm project trong db thông qua folder_id và project_name để lưu các thông tin còn thiếu
        //Nếu không tìm thấy thì báo lỗi vui lòng thử lại và không lưu thông tin, trả về client

        if (projectInfo.folder_id && projectInfo.name) {
            const project_db = await db.project.findOne({
                where: {
                    project_folder_id: projectInfo.folder_id,
                    name: projectInfo.name,

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
                    if (projectTagName.trim() === "") { return console.log("Tag rỗng") }
                    else
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
                    isPublic: projectInfo.visibility,
                    trailer: projectInfo.trailer,
                    price: projectInfo.priceValue ?? 0,
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

                // res.json({
                //     status: 400,
                //     message: "Không tìm thấy dự án, vui lòng thử lại"
                // })
            }

        }

    } catch (error) {
        console.log(error);
    }
}

const payWithPaypal = async (req, res) => {
    console.log(process.env.PAYPAL_MODE, process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)

    const amount = 100; // Lấy số tiền từ yêu cầu

    // Tạo đơn hàng
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/user/payment/paypal/success",
            "cancel_url": "http://localhost:3000/user/payment/paypal/cancel"
        },
        "transactions": [{
            "amount": {
                "total": amount,
                "currency": "USD"
            }
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log(error)
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
}
const paypalSuccess = async (req, res) => {
    // Xử lý kết quả thanh toán thành công

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Thanh toán thành công!');
        }
    });
}
const paypalCancel = async (req, res) => {
    res.send("Thanh toán đã bị hủy bỏ")
}
module.exports = {
    uploadProject,
    payWithPaypal,
    paypalSuccess,
    paypalCancel
}