class MyUploadAdapter {
    constructor(loader) {
        // Save the FileLoader instance to use during upload.
        this.loader = loader;
    }

    // Tương lai: phương thức sẽ tải lên hình ảnh đến server của bạn.
    upload() {
        return new Promise((resolve, reject) => {
            // Bạn có thể thực hiện việc tải lên hình ảnh bằng cách sử dụng Fetch API hoặc XMLHttpRequest.
            // Tạo một đối tượng FormData và thêm file vào đó.
            const data = new FormData();
            data.append('image', this.loader.file);

            fetch('/api/v1/editor/upload-image', {
                method: 'POST',
                body: data
            })
                .then(response => response.json())
                .then(result => {
                    // Trả về thông tin hình ảnh đã tải lên.
                    resolve({
                        default: result.url
                    });
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    // Tùy chọn: Hủy tải lên hình ảnh.
    abort() {
        // Tùy chọn: Xử lý trường hợp hủy tải lên.
    }
}

export default MyUploadAdapter;