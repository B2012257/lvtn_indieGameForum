CKEDITOR.ClassicEditor.create(document.getElementById("post_editor"), {
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
})
    .then(async editor => {


        const toolbarElement = editor.ui.view.toolbar.element;
        //Thêm sự kiện khi trình soạn thảo thay đổi trạng thái chỉ đọc thì ẩn thanh công cụ
        editor.on('change:isReadOnly', (evt, propertyName, isReadOnly) => {
            if (isReadOnly) {
                toolbarElement.style.display = 'none';
            } else {
                toolbarElement.style.display = 'flex';
            }
        });

        editor.enableReadOnlyMode('editing is disabled for this project');
        // let content = getDescription();
        // if (content === null || content === undefined || content?.trim() === "") {
        //     content = "Không có mô tả nào cho dự án này."

        // }
        // console.log(content)
        // // Đặt nội dung vào trình soạn thảo
        // await editor.setData(content);
    })
    .catch(error => {
        console.log(error);
    });



let add_comment_btn = document.querySelector(".add_comment_btn");
let close_add_comment_btn = document.getElementById("close_add_comment_btn")
let save_comment_btn = document.getElementById("save_comment_btn")

//Đăng bình luận
save_comment_btn.addEventListener("click", async () => {

})
close_add_comment_btn.addEventListener("click", async () => {
    document.getElementById("add_comment_form").style.display = "none";
    close_add_comment_btn.classList.toggle("d-none");
    add_comment_btn.classList.toggle("d-none");
    save_comment_btn.classList.toggle("d-none");

})

add_comment_btn.addEventListener("click", async () => {
    document.getElementById("add_comment_form").style.display = "flex";
    close_add_comment_btn.classList.toggle("d-none");
    add_comment_btn.classList.toggle("d-none");
    save_comment_btn.classList.toggle("d-none");
})

let reply_btn = document.querySelectorAll(".reply_btn");
let close_reply_btn = document.querySelectorAll(".cancel_save_reply_comment");
reply_btn.forEach(btn => {
    btn.addEventListener("click", async (e) => {
        let target = e.target;
        console.log(target.parentNode)
        let formReply = target.parentNode.parentNode.parentNode.querySelector(".form-reply");
        if (formReply.classList.contains("d-none") === true) {
            formReply.classList.toggle("d-none");
        }
        //Hiển thị form nhập
    })
})
close_reply_btn.forEach(btn => {
    btn.addEventListener("click", async (e) => {
        let target = e.target;
        let formReply = target.parentNode;
        if (formReply.classList.contains("d-none") === false) {
            formReply.classList.toggle("d-none");
        }
        //Hiển thị form nhập
    })
})