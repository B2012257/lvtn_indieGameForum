(async function () {

    new Chart(
        document.getElementById('view-acquisitions'),
        {
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Biểu đồ dự án mới đăng trong tuần'
                    }
                }
            },
            data: {
                labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
                datasets: [
                    {
                        type: 'bar',
                        label: 'Dự án mới',
                        data: [0, 1, 3, 5, 1, 3, 0],
                    },
                    {
                        type: 'line',
                        label: 'Lập trình viên mới',
                        data: [0, 4, 3, 5, 8, 6, 0],
                    },

                ]
            }
        }
    );
})();

(async function () {
    const data = [
        { year: "2010", count: 10 },
        { year: "2011", count: 20 },
        { year: "2012", count: 15 },
        { year: "2013", count: 25 },
        { year: "2014", count: 22 },
        { year: "2015", count: 30 },
        { year: "2016", count: 28 },
    ];

    new Chart(
        document.getElementById('sold-acquisitions'),
        {
            type: 'line',
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Biểu đồ doanh thu trong tuần'
                    }
                }
            },
            data: {
                labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
                datasets: [
                    {

                        label: 'Lượt mua',
                        data: ["200", "300", "0", "100", "612", "240", "80"],
                        borderColor: 'orange',
                        backgroundColor: 'yellow'
                    },

                ],
            },

            //Thiết lập bước nhảy là 1 đơn vị

        }
    );
})();
(async function () {
    const data = [
        { year: "2010", count: 10 },
        { year: "2011", count: 20 },
        { year: "2012", count: 15 },
        { year: "2013", count: 25 },
        { year: "2014", count: 22 },
        { year: "2015", count: 30 },
        { year: "2016", count: 28 },
    ];

    new Chart(
        document.getElementById('newpost-acquisitions'),
        {
            type: 'line',
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Bài viết mới trong tuần'
                    }
                }
            },
            data: {
                labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
                datasets: [
                    {

                        label: 'Bài viết',
                        data: ["2", "3", "8", "1", "6", "2", "0"],
                        borderColor: 'orange',
                        backgroundColor: 'yellow'
                    },

                ],
            },

            //Thiết lập bước nhảy là 1 đơn vị

        }
    );
})();
