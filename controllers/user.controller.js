require('dotenv').config();

const ggdrive = require("../services/google.clound/index");
const api = require("./webApi.controller")
const db = require("../models/index")
const paypal = require('paypal-rest-sdk');
const transporter = require("../services/nodemailer/index")
const querystring = require('qs');
const crypto = require("crypto");
const vnpay = require('vnpay');
const { log } = require('console');
const moment = require('moment');
const { where } = require('sequelize');
const VNPay = vnpay.VNPay
const VND_TO_USD_EXCHANGE_RATE = process.env.VND_TO_USD_EXCHANGE_RATE
// Cấu hình VNPay
const vnp_TmnCode = '65Z5FVGZ'; // Mã website của bạn
const vnp_HashSecret = 'UQYGOWVNTZAWLCNRSNRTPLSURADBATEI'; // Khóa bảo mật của bạn
const returnUrl = 'http://localhost:3000/user/order/vnpay_return/';

let verifyEmailCode

const vnpayClient = new VNPay({
    api_Host: 'https://sandbox.vnpayment.vn',
    tmnCode: vnp_TmnCode,
    secureSecret: vnp_HashSecret,
    testMode: true, // optional
    hashAlgorithm: 'SHA512', // optional
    paymentEndpoint: 'paymentv2/vpcpay.html', // optional
});


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
                // let version = projectInfo.version
                // db.version.update({
                //     version_number: version
                // }, {
                //     where: {
                //         projectId: project_db.id
                //     }
                // })
                //     .then(row => {
                //     })
                //     .catch(err => {
                //         console.log(err)

                //     })
                //Lưu thông tin vào db//
                //Kiểm tra tags nếu tìm thấy thì lưu id vào project_tag, còn không tìm thấy thì lưu mới vào db và lưu vào project_tag
                let project_tags = []
                project_tags = projectInfo.tags.split(",") // array of tags
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
let project_id = 0;
let total = 0
let project_name = ""
const payWithPaypal = async (req, res) => {
    project_id = req.params.id;
    let payer_email = req.session?.user?.email ?? req.user?.email;
    // console.log(process.env.PAYPAL_MODE, process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    //Tính toán tiền phải thanh toán
    // Qui đổi ngoại tệ
    // Tỷ giá hối đoái từ VND sang USD (ví dụ)
    let project_db = await db.project.findOne({
        where: {
            id: project_id
        },
    })
    project_db = JSON.parse(JSON.stringify(project_db))
    project_name = project_db.name

    let amount = parseFloat(project_db.price) * parseFloat(VND_TO_USD_EXCHANGE_RATE); // Lấy số tiền từ yêu cầu
    console.log(amount);
    amount = Math.round(amount * 100) / 100
    total = amount
    console.log(amount);

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
    let payer_email = req.session?.user?.email ?? req.user?.email;

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
    };


    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(payment)
            console.log(payment.id)

            // Gửi email thông báo khi thanh toán thành công
            const mailOptions = {
                from: 'Admin Indie Game VN (-.-)',
                to: payer_email,
                subject: 'Thông báo thanh toán dự án thành công',
                text: 'Your payment was successful. Thank you for your purchase.',
                html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
    <style>
        /* CSS inline được sử dụng để đảm bảo hiển thị chính xác trên các máy khách email khác nhau */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        h2 {
            color: #007bff;
        }
        p {
            margin-bottom: 15px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Xác nhận thanh toán thành công</h2>
        <p>Thanh toán thành công. Cảm ơn bạn!</p>
        <p>Chi tiết thanh toán:</p>
        <ul>
            <li><strong>Product:</strong>${project_name}</li>
            <li><strong>Price:</strong> ${payment.transactions[0].amount.total}</li>
        </ul>
        <p>If you have any questions, please feel free to contact us.</p>
        <p>Nếu bạn có câu hỏi nào, xin vui lòng liên hệ với chúng tôi</p>

        <p>
            Regards,<br>
            IndieGameVN
        </p>
    </div>
</body>
</html>
`
            };

            // Lưu thông tin giao dịch vào db

            //Lấy ra phương thức thanh toán
            let payment_method_db = await db.payment_method.findOne({
                where: {
                    name: "paypal"
                }
            })
            //Lấy ra userId và ProjectId
            let project_db = await db.project.findOne({
                where: {
                    id: project_id
                },
                include: [
                    {
                        model: db.version,
                        order: [['createdAt', 'DESC']],
                    }
                ]
            })
            project_db = JSON.parse(JSON.stringify(project_db))
            let payer = await db.user.findOne({
                where: {
                    email: payer_email
                },

            })
            console.log(project_db)
            //Lưu thông tin giao dịch
            await db.payment.create({
                userId: payer.id,
                transactionId: payment.id,
                projectId: project_db.id,
                status: "Success",
                dateOfPayment: new Date(),
                amount: (project_db.price * VND_TO_USD_EXCHANGE_RATE),
                lastPrice: payment.transactions[0].amount.total,
                paymentMethodId: payment_method_db.id
            })
            //share thư mục phiên bản file tải game
            await ggdrive.shareFile({ fileId: project_db.versions[0].versionFolderId, emailToShare: payer.email, shareToUser: true })
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    // 
                    res.render('payment_return', {
                        title: 'Thông tin thanh toán',
                        message: 'Thanh toán thành công! Vui lòng kiểm tra email của bạn để xem chi tiết giao dịch và tệp tải về.'

                    })
                }
            });

        }
    });
}
const paypalCancel = async (req, res) => {
    res.send("Thanh toán đã bị hủy bỏ")
}
let payvnpay_email = ""
const payWithVnpay = async (req, res) => {
    project_id = req.params.id;
    payvnpay_email = req.session?.user?.email ?? req.user?.email;
    //randome tnx 
    const tnx = 'Zacofnj8' + Math.floor(Math.random() * 1000); // Generate your own transaction code

    let project_db = await db.project.findOne({
        where: {
            id: project_id
        },
    })
    project_db = JSON.parse(JSON.stringify(project_db))
    project_name = project_db.name
    let amount = project_db.price; // Lấy số tiền từ yêu cầu //Tính toán từ giảm giá
    console.log(amount);
    const urlString = vnpayClient.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: '192.168.0.1',
        vnp_ReturnUrl: returnUrl,
        vnp_TxnRef: tnx,
        vnp_OrderInfo: `Thanh toan cho ma GD: ${tnx},`,
    })
    res.redirect(urlString)
}
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
const payWithVnpayReturn = async (req, res) => {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];
    let amount = vnp_Params['vnp_Amount'];

    let vnp_OrderInfo = vnp_Params['vnp_OrderInfo'];
    let vnp_TransactionNo = vnp_Params['vnp_TransactionNo'];
    console.log(amount);
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = vnp_TmnCode;
    let secretKey = vnp_HashSecret;

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    // console.log(secureHash, signed);
    amount = amount.toString().slice(0, -2) //Xoá 2 số 0 cuối cùng (dư)
    if (secureHash === signed) {
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
        //Xử lý kết quả thanh toán
        // Gửi email thông báo khi thanh toán thành công

        //Lấy ra phương thức thanh toán
        let payment_method_db = await db.payment_method.findOne({
            where: {
                name: "vnpay"
            }
        })
        //Lấy ra userId và ProjectId
        let project_db = await db.project.findOne({
            where: {
                id: project_id
            },
            include: [
                {
                    model: db.version,
                    order: [['createdAt', 'DESC']],
                }
            ]
        })
        project_db = JSON.parse(JSON.stringify(project_db))
        const mailOptions = {
            from: 'Admin Indie Game VN (-.-)',
            to: payvnpay_email,
            subject: 'Thông báo thanh toán dự án thành công',
            text: 'Your payment was successful. Thank you for your purchase.',
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
    <style>
        /* CSS inline được sử dụng để đảm bảo hiển thị chính xác trên các máy khách email khác nhau */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        h2 {
            color: #007bff;
        }
        p {
            margin-bottom: 15px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Xác nhận thanh toán thành công</h2>
        <p>Thanh toán thành công. Cảm ơn bạn!</p>
        <p>Chi tiết thanh toán:</p>
        <ul>
            <li><strong>Product:</strong>${project_name}</li>
            <li><strong>Price:</strong> ${amount}</li>
        </ul>
        <p>If you have any questions, please feel free to contact us.</p>
        <p>Nếu bạn có câu hỏi nào, xin vui lòng liên hệ với chúng tôi</p>

        <p>
            Regards,<br>
            IndieGameVN
        </p>
    </div>
</body>
</html>
`
        };

        // Lưu thông tin giao dịch vào db
        let payer = await db.user.findOne({
            where: {
                email: payvnpay_email
            },
        })

        //Lưu thông tin giao dịch
        await db.payment.create({
            userId: payer.id,
            transactionId: vnp_TransactionNo,
            projectId: project_db.id,
            status: "Success",
            dateOfPayment: new Date(),
            amount: project_db.price, // Giá gốc
            lastPrice: amount, // Giá đã qa giảm giá
            paymentMethodId: payment_method_db.id
        })
        //share thư mục phiên bản file tải game
        await ggdrive.shareFile({ fileId: project_db.versions[0].versionFolderId, emailToShare: payer.email, shareToUser: true })
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                // 
                res.render('payment_return', {
                    title: 'Thông tin thanh toán',
                    message: 'Thanh toán thành công! Vui lòng kiểm tra email của bạn để xem chi tiết giao dịch và tệp tải về.'
                    , redirect: '/user/libary'
                })
            }
        });
        res.render('payment_return', {
            title: 'Thông tin thanh toán',
            message: 'Thanh toán thành công! Vui lòng kiểm tra email của bạn để xem chi tiết giao dịch và tệp tải về.'
            , redirect: '/user/libary'
        })

    } else {
        res.render('payment_return', {
            title: 'Chi tiết thanh toán VNPay',
            message: "Thanh toán thất bại! Vui lòng thử lại."
        })
    }
}
const ratingProject = async (req, res) => {
    let user = req.session?.user ?? req.user;
    let project_id = req.body.id;
    let commentContent = req.body.comment
    let ratingScore = req.body.experience
    console.log(user,
        project_id,
        commentContent,
        ratingScore,);
    try {
        let projectdb = await db.project.findOne({
            where: {
                id: project_id
            }
        })
        await db.user_rating.create({
            userId: user.id,
            projectId: project_id,
            numberStarRate: ratingScore,
            contentRate: commentContent
        })
        projectdb = JSON.parse(JSON.stringify(projectdb))
        res.redirect(`/project/${projectdb.slug}/rating`)
    } catch (e) {
        console.log(e);
    }
}

const editProject = async (req, res) => {
    let project_id = req.params.projectId;
    let publicQuery = req.query.public?.toLowerCase() || undefined

    //Nếu có chỉnh sửa dự án public thì thực hiện
    if (publicQuery) {
        try {
            await db.project.update({
                isPublic: publicQuery === 'true' ? true : false
            }, {
                where: {
                    id: project_id
                }
            })
        } catch (error) {
            console.log(error)
        }
        finally {
            res.redirect(`/user/project/${project_id}/edit`)

        }
    }
}
const payWithFree = async (req, res) => {
    let project_id = req.params.id;
    let payer_email = req.session?.user?.email ?? req.user?.email;

    let project_db = await db.project.findOne({
        where: {
            id: project_id
        },
        include: [
            {
                model: db.version,
                order: [['createdAt', 'DESC']],
            }
        ]
    })
    project_db = JSON.parse(JSON.stringify(project_db))
    console.log("payer_email", payer_email);
    const mailOptions = {
        from: 'Admin Indie Game VN (-.-)',
        to: payer_email,
        subject: 'Thông báo thanh toán dự án thành công',
        text: 'Your payment was successful. Thank you for your purchase.',
        html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
    <style>
        /* CSS inline được sử dụng để đảm bảo hiển thị chính xác trên các máy khách email khác nhau */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        h2 {
            color: #007bff;
        }
        p {
            margin-bottom: 15px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Xác nhận thanh toán thành công</h2>
        <p>Thanh toán thành công. Cảm ơn bạn!</p>
        <p>Chi tiết thanh toán:</p>
        <ul>
            <li><strong>Product:</strong>${project_db.name}</li>
            <li><strong>Price:</strong> Miễn Phí</li>
        </ul>
        <p>If you have any questions, please feel free to contact us.</p>
        <p>Nếu bạn có câu hỏi nào, xin vui lòng liên hệ với chúng tôi</p>

        <p>
            Regards,<br>
            IndieGameVN
        </p>
    </div>
</body>
</html>
        `
    }
    // Lưu thông tin giao dịch vào db
    let payer = await db.user.findOne({
        where: {
            email: payer_email
        },
    })
    console.log(payer);
    //Lưu thông tin giao dịch
    await db.payment.create({
        userId: payer.id,
        projectId: project_db.id,
        status: "Success",
        dateOfPayment: new Date(),
        amount: 0, // Giá gốc
        lastPrice: 0, // Giá đã qa giảm giá
        transactionId: "free" + Math.round(Math.random() * 10000),
    })
    console.log({ fileId: project_db.versions[0].versionFolderId, emailToShare: payer.email, shareToUser: true });
    //share thư mục phiên bản file tải game
    await ggdrive.shareFile({ fileId: project_db.versions[0].versionFolderId, emailToShare: payer.email, shareToUser: true })
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            // 
            res.render('payment_return', {
                title: 'Thông tin thanh toán',
                message: 'Thanh toán thành công! Vui lòng kiểm tra email của bạn để xem chi tiết giao dịch và tệp tải về.'
                , redirect: '/user/libary'
            })
        }
    });
}

const getVerifyEmailPage = async (req, res) => {
    //Khởi tạo verifyCode ngẫu nhiên 6 ký tự số
    verifyEmailCode = Math.floor(100000 + Math.random() * 900000)
    console.log("code", verifyCode);
    let userId = req.params.id
    let user_db = await db.user.findOne({
        where: {
            id: userId
        }
    })
    user_db = JSON.parse(JSON.stringify(user_db))
    console.log(user_db);
    //Gữi email xác thực
    const mailOptions = {
        from: 'Admin Indie Game VN (-.-)',
        to: user_db.email,
        subject: 'Mã xác thực tài khoản',
        text: 'Mã xác thực của bạn là: ' + verifyEmailCode,
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);

        }
    })
    res.render('verify_email', {
        title: 'Xác thực email',
        verifyCode,
        message: "Mã xác thực gồm 6 chữ số đã được gửi đến email của bạn, vui lòng kiểm tra email để xác thực tài khoản",
        user: user_db,
        redirect: false,

        header: true,
        footer: false
    })
}
const verifyCode = async (req, res) => {
    let userId = req.params.id
    let code = req.body.code
    let user_db = await db.user.findOne({
        where: {
            id: userId
        }
    })
    user_db = JSON.parse(JSON.stringify(user_db))
    //Kiểm tra code
    if (code == verifyEmailCode) {
        await db.user.update({
            isActive: true
        }, {
            where: {
                id: userId
            }
        })
        res.render('verify_email', {
            title: 'Xác thực email thành công',
            message: "Xác thực thành công! Tài khoản của bạn đã được kích hoạt",
            user: user_db,
            header: true,
            footer: false,
            redirect: true,
            redirectUrl: `/user/my-profile`
        })
    } else {
        res.render('verify_email', {
            title: 'Xác thực email thành công',
            message: "Xác thực thành công! Tài khoản của bạn đã được kích hoạt",
            user: user_db,
            header: true,
            footer: false,
            redirect: true,
            redirectUrl: `/user/my-profile`

        })
    }
}
const setDiscount = async (req, res) => {
    moment.locale('vi')
    let projectId = req.body.projectId;
    let discount = req.body.percent;
    let start = req.body.start;
    let end = req.body.end;


    try {
        //Thêm mới hoặc ghi đè nếu tồn tại
        //Nếu có giảm giá còn hạn thì ghi đè
        let discount_db_intime = await db.discount.findOne({
            where: {
                projectId: projectId,
                endDate: {
                    [db.Sequelize.Op.gte]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                }
            }
        })
        discount_db_intime = JSON.parse(JSON.stringify(discount_db_intime))
        console.log(discount_db_intime);

        //Nếu ngày kết thúc nhỏ hơn ngày hôm nay thì không hợp lệ
        if (
            moment(end).isBefore(moment(new Date()))
        ) {
            console.log("Ngày hết hạn không hợp lệ");
            res.json({
                status: 400,
                message: "Ngày kết thúc không hợp lệ"
            })
            return;
        }


        //Nếu có giảm giá còn hạn thì ghi đè
        if (discount_db_intime) {
            await db.discount.update({
                discountValuePercent: discount,
                startDate: moment(start).format('YYYY-MM-DD HH:mm:ss'),
                endDate: moment(end).format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    id: discount_db_intime.id
                }
            })
        } else {
            await db.discount.create({
                projectId: projectId,
                discountValuePercent: discount,
                startDate: moment(start).format('YYYY-MM-DD HH:mm:ss'),
                endDate: moment(end).format('YYYY-MM-DD HH:mm:ss')
            })
        }
        //Còn nếu không thì tạo mới
        res.json({ body: req.body })

    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    uploadProject,
    payWithPaypal,
    paypalSuccess,
    paypalCancel,
    payWithVnpay,
    ratingProject,
    payWithVnpayReturn,
    editProject,
    payWithFree,
    getVerifyEmailPage,
    verifyCode,
    setDiscount
}