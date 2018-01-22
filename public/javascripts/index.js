const HTTP_SERVER_URL = 'http://localhost:8080';
const SOCKET_UPDATE_MESSAGE_NAME = 'update-msg';
const SOCKET_QUERY_MESSAGE_NAME = 'query-msg';


//connect to socket.io server in data_handler.js
let socket = io.connect(HTTP_SERVER_URL);
socket.on(SOCKET_UPDATE_MESSAGE_NAME, function (msg) {
    //display raw data from pubnub using socket.io
    $('#data').html(JSON.stringify(msg))
});

socket.on(SOCKET_QUERY_MESSAGE_NAME, function (msg) {
    // display raw HarperDB query
    $('#summary').html(JSON.stringify(msg))
    renderThermometer(msg[0]["avg(ambient_temperature)"]);
    renderRecords(msg[0].records);
    renderRadiation(msg[0]["max(radiation_level)"]);
    renderHumidity(msg[0]["median(humidity)"])
});

function renderRecords(records){
    FusionCharts.ready(function(){
        let fusioncharts = new FusionCharts({
                type: 'vbullet',
                renderAt: 'records-chart',
                id: 'rev-bullet-2',
                width: '240',
                height: '300',
                dataFormat: 'json',
                dataSource: {
                    "chart": {
                        "theme": "fint",
                        "lowerLimit": "0",
                        "subCaptionFontSize": "11",
                        "upperLimit": records * 4,
                        "caption": "Number of Records",
                        "numberSuffix": "K",
                        "chartBottomMargin": "25"
                    },
                    "colorRange": {
                        "color": [{
                            "minValue": "0",
                            "maxValue": records /4,
                            "code": "#e44a00",
                            "alpha": "25"
                        }, {
                            "minValue": records/4,
                            "maxValue": records/2,
                            "code": "#f8bd19",
                            "alpha": "25"
                        }, {
                            "minValue": records *2,
                            "maxValue": records * 4,
                            "code": "#6baa01",
                            "alpha": "25"
                        }]
                    },
                    "value": records,
                    "target": "10000"
                }
            }
        );
        fusioncharts.render();
    });
}

function renderThermometer(temp){
    FusionCharts.ready(function(){
        let fusioncharts = new FusionCharts({
                type: 'thermometer',
                renderAt: 'thermo-chart',
                id: 'myThm-1',
                width: '240',
                height: '300',
                dataFormat: 'json',
                dataSource: {
                    "chart": {
                        "caption": "Temperature Monitor",
                        "subcaption": " Central cold store",
                        "lowerLimit": "-10",
                        "upperLimit": "0",
                        "numberSuffix": "°C",
                        "decimals": "1",
                        "showhovereffect": "1",
                        "thmFillColor": "#008ee4",
                        "showGaugeBorder": "1",
                        "gaugeBorderColor": "#008ee4",
                        "gaugeBorderThickness": "2",
                        "gaugeBorderAlpha": "30",
                        "thmOriginX": "100",
                        "theme": "fint"
                    },
                    "value": temp
                }
            }
        );
        fusioncharts.render();
    });
}

function renderRadiation(rads){
    google.charts.load('current', {'packages':['gauge']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        let data = google.visualization.arrayToDataTable([
            ['Label', 'Value'],
            ['Radation', rads]
        ]);

        let options = {
            width: 240, height: 300,
            redFrom: 1000, redTo: 3000,
            yellowFrom:300, yellowTo: 1000,
            minorTicks: 5,
            max: 3000
        };

        let chart = new google.visualization.Gauge(document.getElementById('radiation-chart'));
        chart.draw(data, options);
    }
}

function renderHumidity(humidity){
    FusionCharts.ready(function(){
        let fusioncharts = new FusionCharts({
                type: 'vled',
                renderAt: 'humidity-chart',
                width: '240',
                height: '300',
                dataFormat: 'json',
                dataSource: {
                    "chart": {
                        "caption": "Humidity",
                        "lowerLimit": "0",
                        "upperLimit": "100",
                        "lowerLimitDisplay": "Empty",
                        "upperLimitDisplay": "Full",
                        "numberSuffix": "%",
                        "showValue": "1",
                        "valueFontSize": "12",
                        "showhovereffect": "1",
                        "chartBottomMargin": "20",
                        "theme": "fint"
                    },
                    "colorRange": {
                        "color": [{
                            "minValue": "0",
                            "maxValue": "45",
                            "code": "#e44a00"
                        }, {
                            "minValue": "45",
                            "maxValue": "75",
                            "code": "#f8bd19"
                        }, {
                            "minValue": "75",
                            "maxValue": "100",
                            "code": "#6baa01"
                        }]
                    },
                    "value": humidity
                }
            }
        );
        fusioncharts.render();
    });
}



