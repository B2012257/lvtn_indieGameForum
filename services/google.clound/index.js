require('dotenv').config();

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID_DRIVE;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET_DRIVE;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI_DRIVE;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;


const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

var that = module.exports = {
    shareFile: async ({ fileId, emailToShare, shareToUser }) => {
        try {
            let request
            if (shareToUser) {
                request = {
                    fileId: fileId,
                    requestBody: {
                        role: 'reader',
                        type: 'user',
                        emailAddress: emailToShare
                    }

                }
            } else {
                request = {
                    fileId: fileId,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone'
                    }
                }
            }
            await drive.permissions.create(request)

            const getUrl = await drive.files.get({
                fileId,
                fields: 'webViewLink, webContentLink'
            })
            return {
                status: 200,
                fileId: fileId,
                data: getUrl.data,
            };
        } catch (error) {
            console.log(error);
            return error

        }
    },
    // Upload image to google drive
    uploadImageFile: async ({ image, shareTo, parent, shareToUser }) => {
        try {
            console.log(shareTo + 'and' + parent)
            const createFile = await drive.files.create({
                requestBody: {
                    name: image.originalname,
                    // mimeType: 'image/jpg',
                    parents: [parent || process.env.PROJECT_FOLDER_ID_DRIVE || ''] //[folder id]
                },
                media: {
                    mimeType: 'image/jpg',
                    body: fs.createReadStream(path.join(__dirname, `/../../${image.path}`))
                }
            })
            const fileId = createFile.data.id;
            let responseData = await drive.files.get({
                fileId,
                fields: "webViewLink, webContentLink"
            })
            console.log(responseData.data, responseData.status, responseData.statusText);
            return await that.shareFile({ fileId, emailToShare: shareTo, shareToUser });

            //xoá file vừa upload

        } catch (error) {
            console.log({
                statusNumber: 400,

                message: "Upload file failed!",
                errorMessage: error
            });
            return error;
        }
        finally {
            try {
                await fs.unlink(path.join(__dirname, `/../../${image.path}`), (err) => {
                    if (err) throw err;
                    console.log('File was deleted');
                });
            } catch (error) {
                console.error('Error deleting temporary file:', error);
            }
        }
    },
    // Upload image to google drive
    uploadCompressedFile: async ({ file, shareTo, parent, shareToUser }) => {
        try {

            const filePath = path.join(__dirname, `/../../${file.path}`);
            if (!fs.existsSync(filePath)) {
                throw new Error('Không tìm thấy tệp: ' + filePath);
            }
            const createFile = await drive.files.create({
                requestBody: {
                    name: file.originalname,
                    //mimeType: 'application/vnd.google-apps.file',
                    parents: [parent || process.env.PROJECT_FOLDER_ID_DRIVE || ''] //[folder id]
                },
                media: {
                    mimeType: 'application/zip',
                    body: fs.createReadStream(filePath)
                }
            })
            const fileId = createFile.data.id;
            let responseData = await drive.files.get({
                fileId,
                fields: "webViewLink, webContentLink"
            })
            console.log(responseData.data, responseData.status, responseData.statusText);
            //xoá file vừa upload
            return await that.shareFile({ fileId, emailToShare: shareTo, shareToUser });


        } catch (error) {
            console.log({
                statusNumber: 400,

                message: "Upload file failed!",
                errorMessage: error
            });
            return error;
        }
        finally {
            //     try {
            //         if (fs.existsSync(path.join(__dirname, `/../../${file.path}`))) {
            //             await fs.unlink(path.join(__dirname, `/../../${file.path}`), (err) => {
            //                 if (err) { console.log(err); };
            //                 console.log('File was deleted');
            //                 return;
            //             });
            //         }
            //         return

            //     } catch (error) {
            //         console.log('Error deleting temporary file:', error);
            //     }
        }
    },
    // Delete file with fileId
    deleteFile: async (fileId) => {
        try {
            console.log('Delete File:::', fileId);
            const deleteFile = await drive.files.delete({
                fileId: fileId
            })
            console.log(deleteFile.data, deleteFile.status)
        } catch (error) {
            console.error(error);
        }
    },
    //Create new folder with name, return id of this folder
    // id for folder projects. to save all projects in website
    async createFolder({ name, parents = [process.env.PROJECT_FOLDER_ID_DRIVE], shareToEmail, shareToUser }) {

        const metadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parents || ['']
        };
        try {
            const file = await drive.files.create({
                resource: metadata,
                fields: 'id',
            });
            console.log('Folder Id:', file.data.id);
            await that.shareFile({ fileId: file.data.id, emailToShare: shareToEmail, shareToUser });

            return file.data.id;
        } catch (err) {
            // TODO(developer) - Handle error
            console.log(err)
            throw err;
        }
    },
    //search with folder name, return id, name, mineType, parents, webViewLink of this folder
    async searchFolder({ name1 }) {
        const searchQuery = {
            mimeType: 'application/vnd.google-apps.folder',
            q: `name = "${name1 || ""}"`,
            fields: 'files(id, name, mimeType, parents, webViewLink)',
            spaces: 'drive',
        };
        try {
            const file = await drive.files.list(searchQuery);
            console.log('Found folder:', file.data);

            Array.prototype.forEach.call(file.data.files, (f) => {
                console.log(`${f.name} (${f.parents})`);
            })
            return file;
        } catch (err) {
            // TODO(developer) - Handle error
            throw err;
        }
    }
}