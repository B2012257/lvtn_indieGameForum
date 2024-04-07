let charDataOfPaymentCountWeek = JSON.parse(document.querySelector("#chartDataNewPaid").textContent);
let charDataOfNewProjectCountWeek = JSON.parse(document.querySelector("#chartDataNewProject").textContent);
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
                labels: charDataOfNewProjectCountWeek.map(row => row.date),
                datasets: [
                    {
                        type: 'bar',
                        label: 'Dự án mới',
                        data: charDataOfNewProjectCountWeek.map(row => row.count)
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
                        text: 'Biểu đồ lượng mua hàng trong tuần'
                    }
                }
            },
            data: {
                labels: charDataOfPaymentCountWeek.map(row => row.date),
                datasets: [
                    {

                        label: 'Lượt mua',
                        data: charDataOfPaymentCountWeek.map(row => row.count),
                        borderColor: 'orange',
                        backgroundColor: 'yellow'
                    },

                ],
            },

            //Thiết lập bước nhảy là 1 đơn vị

        }
    );
})();
