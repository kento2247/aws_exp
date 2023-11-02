let title = document.getElementById("chart_title").value;
let target = document.getElementById("chart_target").value;
let dstr = String(document.getElementById("chart_data").value);
let darr = dstr.split(",");
let dlabel = String(document.getElementById("chart_labels").value);
let larr = dlabel.split(",");
let ctx = document.getElementById("myChart").getContext("2d");

// console.log(title);
// console.log(target);
// console.log(darr);
// console.log(larr);
let max_y = Math.max(...darr);
let step_y = Math.ceil(max_y / 5);

let myRadarChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: larr,
    datasets: [
      {
        data: darr, //app.pyのchart_data
        backgroundColor: "rgba(255,0,0,0.2)", // 線の下の塗りつぶしの色
        borderColor: "red", // 線の色
        borderWidth: 2, // 線の幅
        pointStyle: "circle", // 点の形状
        pointRadius: 6, // 点形状の半径
        pointBorderColor: "red", // 点の境界線の色
        pointBorderWidth: 2, // 点の境界線の幅
        pointBackgroundColor: "yellow", // 点の塗りつぶし色
        pointLabelFontSize: 20,
        label: target, //app.pyのchart_target
      },
    ],
  },
  options: {
    responsive: true,
    legend: {
      display: false,
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            min: 0,
            max: step_y * 5,
            stepSize: step_y,
            fontSize: 20,
          },
        },
      ],
      xAxes: [
        {
          ticks: {
            fontSize: 20,
          },
        },
      ],
    },
  },
});
