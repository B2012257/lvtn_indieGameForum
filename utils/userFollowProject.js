const db = require("../models/index");

//Tính toán số người theo dõi 1 dự án
const calculateUserFollowProject = async ( projectId) => {
    return await db.user_follow.count({
        where: {
            projectId: projectId
        }
    });
}
module.exports = {
    calculateUserFollowProject
}