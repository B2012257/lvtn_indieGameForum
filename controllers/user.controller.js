require('dotenv').config();

const ggdrive = require("../services/google.clound/index");
const api = require("./webApi.controller")
const db = require("../models/index")
const paypal = require('paypal-rest-sdk');
const transporter = require("../services/nodemailer/index")
const querystring = require('qs');
const crypto = require("crypto");
const vnpay = require('vnpay');
const VNPay = vnpay.VNPay

// Cấu hình VNPay
const vnp_TmnCode = '65Z5FVGZ'; // Mã website của bạn
const vnp_HashSecret = 'UQYGOWVNTZAWLCNRSNRTPLSURADBATEI'; // Khóa bảo mật của bạn
const returnUrl = 'http://localhost:3000/user/order/vnpay_return';

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
    let project_id = req.params.id;
    let payer_email = req.session?.user?.email ?? req.user?.email;
    // console.log(process.env.PAYPAL_MODE, process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    //Tính toán tiền phải thanh toán
    // Qui đổi ngoại tệ
    // Tỷ giá hối đoái từ VND sang USD (ví dụ)
    const VND_TO_USD_EXCHANGE_RATE = 0.000043;
    const { price } = await db.project.findOne({
        where: {
            id: project_id
        },
    })
    console.log(price, payer_email);
    const amount = price * VND_TO_USD_EXCHANGE_RATE; // Lấy số tiền từ yêu cầu
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

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(payment);
            res.send('Thanh toán thành công!');
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
        <h2>Payment Confirmation</h2>
        <p>Your payment was successful. Thank you for your purchase!</p>
        <p>Details of your purchase:</p>
        <ul>
            <li><strong>Product:</strong> Product Name</li>
            <li><strong>Price:</strong> $25.00</li>
        </ul>
        <p>If you have any questions, please feel free to contact us.</p>
        <p>
            Regards,<br>
            IndieGameVN
        </p>
    </div>
</body>
</html>
`
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

        }
    });
}
const paypalCancel = async (req, res) => {
    res.send("Thanh toán đã bị hủy bỏ")
}
const payWithVnpay = async (req, res) => {
    //randome tnx 
    const tnx = '12345678' + Math.floor(Math.random() * 1000); // Generate your own transaction code

    const urlString = vnpayClient.buildPaymentUrl({
        vnp_Amount: 100000,
        vnp_IpAddr: '192.168.0.1',
        vnp_ReturnUrl: returnUrl,
        vnp_TxnRef: tnx,
        vnp_OrderInfo: `Thanh toan cho ma GD: ${tnx}`,
    })
    res.redirect(urlString)
}
const payWithVnpayReturn = async (req, res) => {
    var vnp_Params = req.query;

    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    var tmnCode = vnp_TmnCode;
    var secretKey = vnp_HashSecret;

    var signData = querystring.stringify(vnp_Params, { encode: false });
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
        res.render('success', { code: vnp_Params['vnp_ResponseCode'] })
    } else {
        res.render('success', { code: '97' })
    }
}
module.exports = {
    uploadProject,
    payWithPaypal,
    paypalSuccess,
    paypalCancel,
    payWithVnpay,
    payWithVnpayReturn
}