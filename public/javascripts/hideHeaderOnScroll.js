//bắt sự kiện scroll down và làm mở thanh header
window.addEventListener('scroll', (e) => {
    let header = document.querySelector('#header');
    // Nếu cuộn xuống 100px thì ẩn thanh header bằng opacity tăng dần
    if (window.scrollY > 100) {
        header.style.opacity = 0;
    } else {
        header.style.opacity = 1;
    }
});