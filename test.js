var weather1URL = "https://api.weather.gov/points/";
var weather2URL = "https://api.open-meteo.com/v1/forecast";
var iconURL = "https://api.weather.gov/icons/land/day/";
var testURL = "https://geocoding-api.open-meteo.com/v1/search?";

var weather1Response = "";
var weather2Response= "";

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

var w1JSON = "";
var w2JSON = "";
//var opAIResponse = [];
var zip = "";


$(document).ready(function() {
                $("#loc").on("click", function() {
                    var loc = document.getElementById("location").value;
                    zip = loc;
                    $.ajax({
                        url: testURL,
                        method: "GET",
                        data: {
                            name: loc,
                            count: 1
                        }
                    }).done(function(data) {
                        $("#invalidZip").html("");
                        if (data.results === undefined) {
                            $("#invalidZip").append("<div class=\"alert alert-warning\" role=\"alert\">Please enter a valid zipcode</div>");
                        } else {
                            getWeather1(data.results[0].latitude, data.results[0].longitude);
                            getWeather2(data.results[0].latitude, data.results[0].longitude);
                        }
                    }).fail(function(error) {
                        console.log(error);
                    });
                });
            });

function getWeather1(lat, lon) {
    $.ajax({
        url: weather1URL + lat + ',' + lon,
        method: "GET"
    }).done(function(data) {
        var URL = data.properties.forecast;
        getForecast1(URL);
    }).fail(function(error) {
        console.log(error);
    })
}

function getForecast1(URL) {
    $.ajax({
        url: URL,
        method: "GET"
    }).done(function(data) {
        var len = data.properties.periods.length;
        w1JSON = data.properties.periods;
        $("#mainWeather1").html("");
        $("#mainWeather1").prepend("<h4 class=\"big-margin\">Weather.gov</h4>");
        $("#mainWeather1").append("<div class=\"d-flex flex-wrap equal-cols\" id=\"mainWeather\"></div>")
        for (let i = 0; i < len; i+=2) {
            weather1Response += data.properties.periods[i].name + ": " + data.properties.periods[i].temperature + "Farenheight, " 
            + data.properties.periods[i].shortForecast + ". ";
            $("#mainWeather").append("<div class=\"flex-grow-1 p-3 border text-center weatherCol\" id=\"w1" + i + "\">" +
                "<h4 id=\"name\">" + data.properties.periods[i].name + "</h4><h4>" 
                + data.properties.periods[i].temperature + "&deg;" + data.properties.periods[i].temperatureUnit + 
                "<br><img src=\"" + data.properties.periods[i].icon + "\" class=\"rounded\">"+
                "</h4><h6>" + data.properties.periods[i].probabilityOfPrecipitation.value + "% Chance of Precipitation</h6><p id=\"shortFore\">" + 
                data.properties.periods[i].shortForecast + "</p></div>");
        }
       // getOpenAI(weather1Response, "#openai1");
    }).fail(function(error) {
        console.log(error);
    })
}

function getWeather2(lat, lon) {
    $.ajax({
            url: weather2URL,
            data: {
                latitude: lat,
                longitude: lon,
                daily: "temperature_2m_mean,precipitation_probability_mean,weather_code",
                wind_speed_unit: "mph",
                temperature_unit: "fahrenheit"
            }
    }).done(function(data) {
        w2JSON = data.daily;
        $("#weather2").html("");
        $("#weather2").prepend("<h4 class=\"big-margin\">Open Meteo</h4>");
        $("#weather2").append("<div class=\"d-flex flex-wrap equal-cols\" id=\"weather2Row\"></div>")
        var len = data.daily.time.length;
        for (var i = 0; i < len; i++) {
            var d = new Date(data.daily.time[i]).getDay();
            var forecast = interpretWeatherCode(data.daily.weather_code[i]);
            weather2Response += weekday[(d + 1) % 7] + ":" + data.daily.temperature_2m_mean[i] + "Farenheight, " 
            + data.daily.precipitation_probability_mean[i] + forecast + ". ";
            $("#weather2Row").append("<div class=\"flex-grow-1 p-3 border text-center weatherCol\" id=\"w2" + i + "\">"
                 +"<h4>"+ weekday[(d + 1) % 7] + "</h4><h4>" + data.daily.temperature_2m_mean[i] + "&deg;F</h4>"
                 + "<img src=\"" + iconURL + getWeatherIcon(data.daily.weather_code[i]) + "?size=medium\" class=\"rounded\"><h6>"
                 + data.daily.precipitation_probability_mean[i] + 
                "% Chance of Precipitation</h6><p>" + forecast + "</p></div>");
        }
       // getOpenAI(weather2Response, "#openai2");
    }).fail(function(error) {
        console.log(error);
    })
}

function interpretWeatherCode(code) {
    if (code == 0) {
        return "Clear sky";
    } else if (code == 1 || code == 2 || code == 3) {
        return "Partly cloudy";
    } else if (code == 51 || code == 53 || code == 55 || code == 56 || code == 57) {
        return "Light rain";
    } else if (code == 61 || code == 63 || code == 65 || code == 66 || code == 67 || code == 80 || code == 81 || code == 82) {
        return "Rainy";
    } else if (code == 95 || code == 96 || code == 99){
        return "Thunderstorms"
    } else if (code == 45 || code == 48) {
        return "Foggy";
    } else {
        return "Snowy";
    }
}
function getWeatherIcon(code) {
    if (code == 0) {
        return "skc";
    } else if (code == 1 || code == 2 || code == 3) {
        return "bkn";
    } else if (code == 51 || code == 53 || code == 55 || code == 56 || code == 57) {
        return "rain";
    } else if (code == 61 || code == 63 || code == 65 || code == 66 || code == 67 || code == 80 || code == 81 || code == 82) {
        return "rain";
    } else if (code == 95 || code == 96 || code == 99){
        return "tsra"
    } else if (code == 45 || code == 48) {
        return "fog";
    } else {
        return "snow";
    }
}
// function getOpenAI(weatherData, colName) {
//     // $.ajax({
//     //     url: "final.php/openaiproxy",
//     //     method: "POST",
//     //     data: {
//     //         endpoint: "responses",
//     //         payload: JSON.stringify({model: "gpt-5", input: "Give me a summary in paragraph format of the weather based on this data: " + weatherData})
//     //     },
//     //  }).done(function(d) {
//     //     $(colName).html("");
//     //     opAIResponse.push(d.output[1].content[0].text + "+");
//     //     $(colName).append("<p class=\"big-margin\">" + d.output[1].content[0].text + "</p>");
//     opAIResponse.push(" ");
//         if (zip != "" && w1JSON != "" && w2JSON != "" && opAIResponse.length == 2) {
//             addHistoryLog(zip, JSON.stringify(w1JSON), JSON.stringify(w2JSON), opAIResponse.toString());
//             zip = "";
//             w1JSON = "";
//             w2JSON = "";
//             opAIResponse = [];
//         }
//     // }).fail(function(error) {
//     //     console.log(error);
//     // })
// }
// function addHistoryLog(request, w1, w2, opAI) {
//     $.ajax({
//         url: "final.php/addLog",
//         method: "POST",
//         data: {
//             request: request,
//             weather1: w1,
//             weather2: w2,
//             openai: opAI
//         }
//     }).done(function(data) {
//         console.log(data);
//     }).fail(function(error) {
//         console.log(error);
//     })
// }
// function getHistory(request) {
//     $.ajax({
//         url: "final.php/getLog",
//         method: "POST",
//         data: {
//             request: request
//         }
//     }).done(function(data) {
//         // use JSON.parse to turn weather data back to JSON
//         // use str.split(seperator) to split openai data into 1 and 2
//         // data I care about: data.result[0]
//         var w1J = JSON.parse(data.result[0].weather1);
//         var w2J = JSON.parse(data.result[0].weather2);
//         var openaiData = data.result[0].openai.split('+', 2);
//         $("#mainWeather1").html("");
//         $("#mainWeather1").prepend("<h4 class=\"big-margin\">Weather.gov</h4>");
//         $("#mainWeather1").append("<div class=\"d-flex flex-wrap equal-cols\" id=\"mainWeather\"></div>")
//         for (let i = 0; i < w1J.length; i+=2) {
//             $("#mainWeather").append("<div class=\"flex-grow-1 p-3 border text-center weatherCol\" id=\"w1" + i + "\">" +
//                 "<h4 id=\"name\">" + w1J[i].name + "</h4><h4>" 
//                 + w1J[i].temperature + "&deg;" + w1J[i].temperatureUnit + 
//                 "<br><img src=\"" + w1J[i].icon + "\" class=\"rounded\">"+
//                 "</h4><h6>" + w1J[i].probabilityOfPrecipitation.value + "% Chance of Precipitation</h6><p id=\"shortFore\">" + 
//                 w1J[i].shortForecast + "</p></div>");
//         }
//         $("#openai1").html("");
//         $("#openai1").append("<p class=\"big-margin\">" + openaiData[0] + "</p>");

//         $("#weather2").html("");
//         $("#weather2").prepend("<h4 class=\"big-margin\">Open Meteo</h4>");
//         $("#weather2").append("<div class=\"d-flex flex-wrap equal-cols\" id=\"weather2Row\"></div>")
//         for (var i = 0; i < w2J.time.length; i++) {
//             var d = new Date(w2J.time[i]).getDay();
//             var forecast = interpretWeatherCode(w2J.weather_code[i]);

//             $("#weather2Row").append("<div class=\"flex-grow-1 p-3 border text-center weatherCol\" id=\"w2" + i + "\">"
//                  +"<h4>"+ weekday[(d + 1) % 7] + "</h4><h4>" + w2J.temperature_2m_mean[i] + "&deg;F</h4>"
//                  + "<img src=\"" + iconURL + getWeatherIcon(w2J.weather_code[i]) + "?size=medium\" class=\"rounded\"><h6>"
//                  + w2J.precipitation_probability_mean[i] + "% Chance of Precipitation</h6><p>" + forecast + "</p></div>");
//         }
//         $("#openai2").html("");
//         $("#openai2").append("<p class=\"big-margin\">" + openaiData[1].substring(1) + "</p>");
//     }).fail(function(error) {
//         console.log(error);
//     })
// }
// function loadHistory() {
//     $.ajax({
//         url: "final.php/getRequests",
//         method: "POST"
//     }).done(function(data) {
//         var len = data.result.length;
//         for (let i = 0; i < len; i++) {
//             $("#historyList").append("<li class=\"btn btn-outline-secondary\" style=\"border-radius: 10px;\"><a href=\"#\" onClick=\"getHistory(" + 
//                 data.result[i].request + ")\">" + data.result[i].logid + ". " 
//                 + data.result[i].request + " | " +data.result[i].timestamp + "</a></li>");
//         }
//     }).fail(function(error) {
//         console.log(error);
//     })
// }