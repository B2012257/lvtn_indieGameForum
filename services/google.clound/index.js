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
    setFilePublic: async ({ fileId, emailToShare }) => {
        try {
            await drive.permissions.create({
                fileId,
                requestBody: {
                    role: 'reader',
                    type: 'user',
                    emailAddress: emailToShare ? emailToShare : 'thaib2012257@student.ctu.edu.vn'
                }
            })

            const getUrl = await drive.files.get({
                fileId,
                fields: 'webViewLink, webContentLink'
            })

            return getUrl;
        } catch (error) {
            console.error(error);
        }
    },
    // Upload image to google drive
    uploadImageFile: async ({ image, shareTo }) => {
        try {
            const createFile = await drive.files.create({
                requestBody: {
                    name: image.originalname,
                    mimeType: 'image/jpg',
                    parents: ["1dWUgY4tEnQOJxUNdZzJJmsvbnHtH9W9o"] //[folder id]
                },
                media: {
                    mimeType: 'image/jpg',
                    body: fs.createReadStream(path.join(__dirname, `/../../${image.path}`))
                }
            })
            const fileId = createFile.data.id;
            console.log(createFile.data)
            const getUrl = await that.setFilePublic({ fileId });

            console.log(getUrl.data);
            //xoá file vừa upload

        } catch (error) {
            console.error(error);
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
    async createFolder(name) {

        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
        };
        try {
            const file = await drive.files.create({
                resource: fileMetadata,
                fields: 'id',
            });
            console.log('Folder Id:', file.data.id);
            return file.data.id;
        } catch (err) {
            // TODO(developer) - Handle error
            throw err;
        }
    },
    //search with folder name, return id, name, mineType, parents, webViewLink of this folder
    async searchFolder(name1) {
        const searchQuery = {
            mimeType: 'application/vnd.google-apps.folder',
            q: `name = "${name1}"` || "",
            fields: 'files(id, name, mimeType, parents, webViewLink)',
            spaces: 'drive',
        };
        try {
            const file = await drive.files.list(searchQuery);
            console.log('Found file:', file.data);

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