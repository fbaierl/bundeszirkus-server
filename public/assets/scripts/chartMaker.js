function ChartMaker()
{
    const horizontalBarChartCanvasWidth = 400
    const horizontalBarChartCanvasHeight = 550

    /**
     * Creates the basic options for a horizontal bar chart.
     * @param {string} fontColor font color
     * @param {callback} labelCallback callback determines whats being displayed on hover; 
     * takes an item and the data array
     * @returns {Object} the options object
     */
    var horizontalBarChartOptions = function(fontColor, labelCallback) {
        return {
            responsive: true,
            legend: {
                display: false
            },
            scales: {
            yAxes: [{
                ticks: {
                beginAtZero: true,
                fontColor: fontColor,
                fontSize: 14
                },
            }],
            xAxes: [{
                ticks: {
                beginAtZero: true,
                fontColor: fontColor,
                fontSize: 14
                },
            }]
            },
            tooltips: {
            callbacks: {
                label: labelCallback
                }
            }
        }
    }

    var doughnutChartOptions = function(legendFontColor){
        return {
            pieceLabel: {
                mode: 'percent',
                fontStyle: 'bold',
                fontColor: 'white'
            },
            legend: {
                labels: {
                    fontColor: legendFontColor,
                    fontSize: 14
                }
            }
        }
    }

    this.createTotalPartiesPassiveChart = function(domId){
        $.ajax({
            type: "GET",
            url: "comments_stats_total_parties_passive",
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
                options: doughnutChartOptions('white')
            });
            }
        });
    }

    this.createTotalPartiesChart = function(domId){
        $.ajax({
            type: "GET",
            url: "comments_stats_total_parties",
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
                options: doughnutChartOptions('black')
            });
            }
        });
    }

    this.createTotalPoliticiansPassiveChart = function(domId){
        $.ajax({
            type: "GET",
            url: "comments_stats_total_politicians_passive",
            dataType: "json",
            success: function(response) {
                var ctx = document.getElementById(domId).getContext('2d');
                ctx.canvas.width = horizontalBarChartCanvasWidth;
                ctx.canvas.height = horizontalBarChartCanvasHeight;
                new Chart(ctx, {
                    type: 'horizontalBar',
                    data: {
                        datasets: [{
                            data: response.map(x => x.occurences),
                            backgroundColor: response.map(x => x.color)
                        }],
                        labels: response.map(x => x.fullname)
                    },
                    options: horizontalBarChartOptions('white', 
                        function(item, data) {
                            return response.map(x => x.occurences)[item.index]
                                + " " 
                                + "(" 
                                + response.map(x => x.party)[item.index]  
                                + ")"
                        })
                });
            }
        });
    }

    this.createTotalPoliticiansChart = function(domId){
        $.ajax({
            type: "GET",
            url: "comments_stats_total_politicians",
            dataType: "json",
            success: function(response) {
                var ctx = document.getElementById(domId).getContext('2d');
                ctx.canvas.width = horizontalBarChartCanvasWidth;
                ctx.canvas.height = horizontalBarChartCanvasHeight;
                new Chart(ctx, {
                    type: 'horizontalBar',
                    data: {
                        datasets: [{
                            data: response.map(x => x.occurences),
                            backgroundColor: response.map(x => x.color)
                        }],
                        labels: response.map(x => x.fullname)
                    },
                    options: horizontalBarChartOptions('black', 
                        function(item, data) {
                            return response.map(x => x.occurences)[item.index]
                                + " " 
                                + "(" 
                                + response.map(x => x.party)[item.index]  
                                + ")"
                        })
                });
            }
        });
    }


    this.createTotalCommentsPerSessionPerPartyChart = function(domId){
        const ctx = document.getElementById(domId).getContext('2d')

        let range = function (n) {
            return Array(n).join().split(',').map(function(e, i) { return i; });
          }  
          
        let commentsPerSessionLabels = function(data){
            console.log(data)
        if(data[0]){
            return range(data[0].values.length).map(x => x+1)
        } else {
            return []
        }
        }
        
        let zipSum = function(numbers) {
            if(numbers.length > 0){
                return numbers[0].map(function(_, i) { 
                    return numbers.reduce(function(prev, row) {
                    return row[i] + prev;
                    }, 0);
                });
            } else {
                return [0]
            }

        }
        
        let sum = function(a, b){
            return a + b 
        }

        let commentsPerSessionDatasets = function(data){
            return data.map(function (d) {
                  return {
                    fill: true,
                    label: d.party,
                    data: d.values,
                    backgroundColor: d.color
                  }})  
          }


        $.ajax({
            type: "GET",
            url: "comments_stats_total_count_per_session_per_party",
            dataType: "json",
            success: function(data) {
                new Chart(ctx, {
                    type: 'bar',
                    xAxisID: "Zitzungsnummer",
                    yAxisID: "Anzahl Zwischenrufe",
                    responsive: true,
                    maintainAspectRatio: false,
                    data: {
                      labels: commentsPerSessionLabels(data),
                      datasets: commentsPerSessionDatasets(data)
                    },
                    options: {
                      scales: {
                        xAxes: [{ 
                          stacked: true,
                          scaleLabel: {
                            display: true,
                            labelString: 'Sitzungsnummer'
                          },
                          ticks: {
                            callback: function(tick, index, array) {
                                return (index % 3) ? "" : tick;
                            }
                        }
                        }],
                        yAxes: [{ 
                          stacked: true,
                          scaleLabel: {
                            display: true,
                            labelString: 'Anzahl Zwischenrufe'
                          }
                        }],
                      }
                    }
                  });
            }
        });

    }
}

