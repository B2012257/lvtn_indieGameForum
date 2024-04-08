
let editor = CKEDITOR.ClassicEditor.create(document.getElementById("editor"), {
    ckfinder: {
        uploadUrl: '/api/upload-image',
    },

    // https://ckeditor.com/docs/ckeditor5/latest/features/toolbar/toolbar.html#extended-toolbar-configuration-format
    toolbar: {
        items: [
            'exportPDF', 'exportWord', '|',
            'findAndReplace', 'selectAll', '|',
            'heading', '|',
            'bold', 'italic', 'underline', 'code', 'subscript', 'superscript', '|',
            'bulletedList', 'numberedList', 'todoList', '|',
            'outdent', 'indent', '|',
            'undo', 'redo',
            '-',
            'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
            'alignment', '|',
            'link', 'uploadImage', 'blockQuote', 'insertTable', 'mediaEmbed', 'codeBlock', 'htmlEmbed', '|',
            'specialCharacters', 'horizontalLine', 'pageBreak', '|',
            'sourceEditing'
        ],
        shouldNotGroupWhenFull: true
    },
    // Changing the language of the interface requires loading the language file using the <script> tag.
    // language: 'es',
    list: {
        properties: {
            styles: true,
            startIndex: true,
            reversed: true
        }
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/headings.html#configuration
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
        ]
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/editor-placeholder.html#using-the-editor-configuration
    placeholder: '',
    // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-family-feature
    fontFamily: {
        options: [
            'default',
            'Arial, Helvetica, sans-serif',
            'Courier New, Courier, monospace',
            'Georgia, serif',
            'Lucida Sans Unicode, Lucida Grande, sans-serif',
            'Tahoma, Geneva, sans-serif',
            'Times New Roman, Times, serif',
            'Trebuchet MS, Helvetica, sans-serif',
            'Verdana, Geneva, sans-serif',
        ],
        supportAllValues: true
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-size-feature
    fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true
    },
    // Be careful with the setting below. It instructs CKEditor to accept ALL HTML markup.
    // https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#enabling-all-html-features
    htmlSupport: {
        allow: [
            {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true
            }
        ]
    },
    // Be careful with enabling previews
    // https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html#content-previews
    htmlEmbed: {
        showPreviews: true
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/link.html#custom-link-attributes-decorators
    link: {
        decorators: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
            toggleDownloadable: {
                mode: 'manual',
                label: 'Downloadable',
                attributes: {
                    download: 'file'
                }
            }
        }
    },
    // https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html#configuration
    mention: {
        feeds: [
            {
                marker: '@',
                feed: [
                    '@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton', '@cream',
                    '@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice', '@jelly-o',
                    '@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame', '@snaps', '@soufflé',
                    '@sugar', '@sweet', '@topping', '@wafer'
                ],
                minimumCharacters: 1
            }
        ]
    },

    // The "superbuild" contains more premium features that require additional configuration, disable them below.
    // Do not turn them on unless you read the documentation and know how to configure them and setup the editor.
    removePlugins: [
        // These two are commercial, but you can try them out without registering to a trial.
        // 'ExportPdf',
        // 'ExportWord',
        'AIAssistant',
        //'EasyImage',
        // This sample uses the Base64UploadAdapter to handle image uploads as it requires no configuration.
        // https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/base64-upload-adapter.html
        // Storing images as Base64 is usually a very bad idea.
        // Replace it on production website with other solutions:
        // https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html
        // 'Base64UploadAdapter',
        'RealTimeCollaborativeComments',
        'RealTimeCollaborativeTrackChanges',
        'RealTimeCollaborativeRevisionHistory',
        'PresenceList',
        'Comments',
        'TrackChanges',
        'TrackChangesData',
        'RevisionHistory',
        'Pagination',
        'WProofreader',
        // Careful, with the Mathtype plugin CKEditor will not load when loading this sample
        // from a local file system (file://) - load this site via HTTP server if you enable MathType.
        'MathType',
        // The following features are part of the Productivity Pack and require additional license.
        'SlashCommand',
        'Template',
        'DocumentOutline',
        'FormatPainter',
        'TableOfContents',
        'PasteFromOfficeEnhanced',
        'CaseChange'
    ]
});

// Xử lí khi trình soạn thảo đã sẵn sàng
editor.then(async editor => {
    window.editor = editor;


    const content = getDescription();
    // Đặt nội dung vào trình soạn thảo
    await editor.setData(content);
    document.querySelector('.save_btn').addEventListener('click', (e) => {
        e.preventDefault();
        saveDescription(editor)
    })

})


function getDescription() {
    return document.querySelector("#project_long_description").textContent
}
function saveDescription(editor) {
    const editorData = editor.getData();
    let projectId = document.querySelector("#project_id").textContent
    fetch("/api/v1/project/update/description", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            projectId: projectId,
            description: editorData,
        })

    }).then(res => res.json())
        .then(data => {
            console.log(data)
            if (data.status === 200) {
                alert('Success');
                location.reload();
            } else {
                console.log('Failed');
            }
        })
}

// Bắt sự kiện khi ấn thêm ảnh bìa lớn
document.querySelector('#coverImageLarge').addEventListener('change', (e) => {
    displaySelectedCoverImage(e, '.choosingCoverImageLarge', '.coverImageLargeHref');

})
document.querySelector('#coverImage').addEventListener('change', (e) => {
    displaySelectedCoverImage(e, '.coverImageServer', '.coverImageHref');

})
function displaySelectedCoverImage(event, imgElementSelector, hrefSelector) {
    const selectedImage = document.querySelector(imgElementSelector);
    const fileInput = event.target;


    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.readAsDataURL(fileInput.files[0]); //chuyển ảnh thành url thành url

        reader.onload = function (e) {
            selectedImage.src = e.target.result;
            document.querySelector(`${hrefSelector}`).setAttribute('href', e.target.result);

        };
    }
}

//Bắt sự kiện cập nhật
let updateBtn = document.querySelector('.update-images-btn')
updateBtn.addEventListener('click', async (e) => {

    e.preventDefault();
    //Lấy id project
    let projectId = document.querySelector('.projectId').textContent
    //Lấy ảnh bìa lớn mới
    let newCoverImageLarge = document.querySelector('#coverImageLarge')?.files[0] || "";
    //Lấy ảnh bìa nhỏ mới
    let newCoverImage = document.querySelector('#coverImage')?.files[0] || "";
    //Lấy tất cả ảnh màn hình mới
    let newScreenShot = document.querySelector('#screenshotInput')?.files || "";

    //Trường hợp không thay đổi ảnh bìa lớn so với sv
    let oldCoverImageLarge
    //Nếu không có ảnh bìa lớn mới -> lấy ảnh cũ
    if (newCoverImageLarge === "") {
        oldCoverImageLarge = document.querySelector('.choosingCoverImageLarge')?.src || "";
        console.log("Upload anh bia lon cu", oldCoverImageLarge);
        await uploadImage({ href: oldCoverImageLarge, projectId: projectId, type: "coverImageLarge" })
    } else {
        console.log("Upload anh bia lon moi");
        await uploadImage({ image: newCoverImageLarge, projectId: projectId, type: "coverImageLarge" })
    }

    //Trường hợp không thay đổi ảnh bìa nhỏ so với sv
    //Nếu không có ảnh bìa nhỏ mới -> lấy ảnh cũ
    let oldCoverImage
    if (newCoverImage === "") {
        //img
        oldCoverImage = document.querySelector('.coverImageServer')?.src || "";
        //upload ảnh cũ
        console.log("Upload anh bia nho cu", oldCoverImage);
        await uploadImage({ href: oldCoverImage, projectId: projectId, type: "coverImage" })
    } else {
        console.log("Upload anh bia moi");
        await uploadImage({ image: newCoverImage, projectId: projectId, type: "coverImage" })
    }
    let hrefScreenShotInServer = []
    screenshotImages = document.querySelectorAll('.screenshotInServer');
    screenshotImages.forEach(element => {
        hrefScreenShotInServer.push(element.src);
    });

    if (newScreenShot.length === 0) {
        console.log("Upload ảnh màn cũ")
        newScreenShot = "No"
        await uploadImage({ href: hrefScreenShotInServer, projectId: projectId })
    } else {
        console.log("Upload ảnh màn cũ và mới")
        await uploadImage({ href: hrefScreenShotInServer, projectId: projectId })
        await uploadImage({ images: newScreenShot, projectId: projectId, type: "newScreenshots" })
    }
    location.reload();

})
//upload ảnh
async function uploadImage({ image, images, href, projectId, type }) {
    //Nếu upload 1 ảnh
    let formData = new FormData();
    formData.append('projectId', projectId);
    console.log(image, images, href, projectId);
    if (image) {
        formData.append('image', image);
        formData.append('type', type);

        let response = await fetch('/api/v1/project/update/image', {
            method: 'POST',
            body: formData
        })
        let result = await response.json();
        console.log(result);
    }

    //Nếu upload nhiều ảnh
    if (images) {
        Array.from(images).forEach(element => {
            formData.append('images', element);
            formData.append('type', type);

        });
        let response = await fetch('/api/v1/project/update/image', {
            method: 'POST',
            body: formData
        })
        let result = await response.json();
        console.log(result);
    }

    //Nếu upload đường dẫn ảnh -> ảnh đã có sẵn ở máy chủ
    if (href) {
        if (typeof href === 'string') {
            formData.append('href', href);
            formData.append('type', type);

        } else { //Nếu là mảng
            console.log("Gọi cái này");
            href.forEach(element => {
                formData.append('href', element);
            });
            console.log(href);
        }

        let response = await fetch('/api/v1/project/update/image', {
            method: 'POST',
            body: formData
        })
        let result = await response.json();
        console.log(result);
    }
}