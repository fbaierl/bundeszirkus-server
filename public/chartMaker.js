
function loadTotalPartiesChart(domId){
    $.ajax({
        type: "GET",
        url: "stats_total_parties",
        dataType: "json",
        success: function(response) {
          var ctx = document.getElementById(domId).getContext('2d');
          new Chart(ctx, {
            type: 'doughnut',
            data: {
              datasets: [{
                  data: response.map(x => x.occurences),
                  backgroundColor:  response.map(x => x.color),
              }],
              labels: response.map(x => x.party)
            },
            options: {
                pieceLabel: {
                    mode: 'percent',
                    fontStyle: 'bold',
                    fontColor: '#FFF'
                }
            }
          });
        }
    });
}

function loadTotalPoliticiansChart(domId){
    $.ajax({
        type: "GET",
        url: "stats_total_politicians",
        dataType: "json",
        success: function(response) {
            var ctx = document.getElementById(domId).getContext('2d');
            ctx.canvas.width = 400;
            ctx.canvas.height = 550;
            
            new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                datasets: [{
                data: response.map(x => x.occurences),
                backgroundColor: response.map(x => x.color)
                }],
                labels: response.map(x => x.fullname)
            },
            options: {
                responsive: true,
                legend: {
                display: false
                },
                scales: {
                yAxes: [{
                    ticks: {
                    beginAtZero: true,
                    fontColor: 'black',
                    fontSize: 14
                    },
                }],
                xAxes: [{
                    ticks: {
                    beginAtZero: true,
                    fontColor: 'black',
                    fontSize: 14
                    },
                }]
                },
                tooltips: {
                callbacks: {
                    label: function(item, data) {
                    return response.map(x => x.occurences)[item.index]
                        + " " 
                        + "(" 
                        + response.map(x => x.party)[item.index]  
                        + ")"
                    }
                }
                }
            }
            });
        }
    });
}

function loadCharts(){
    // comments per party - total
   

    // comments per politicians - total
    
  }