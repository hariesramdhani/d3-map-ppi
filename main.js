var margin = { top: -5, right: -5, bottom: -5, left: -5 },
    w = 800 - margin.left - margin.right,
    h = 450 - margin.top - margin.bottom,
    pieW = 225,
    pieH = 225,
    pieR = Math.min(pieW, pieH) / 2;

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

var svg = d3.select("#table").append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    .call(zoom);

function zoomed() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
    d3.select(this).classed("dragging", false);
}

var svgPie = d3.select("#pie-chart").append("svg")
    .attr("width", pieW)
    .attr("height", pieH);

var colorPie = d3.scale.category20c();

var gPie = svgPie.append("g").attr("transform", "translate(" + pieW / 2 + "," + pieH / 2 + ")");

var color = d3.scale.log()
    .range(['#cbefbd', '#9ad1a4', '#70a894', '#4f788a', '#344484', '#000080']);

var colorSaintek = d3.scale.log()
    .range(['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac']);

var colorWoman = d3.scale.linear()
    .domain([0, 100])
    .range(["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"]);

var colorMan = d3.scale.linear()
    .domain([0, 100])
    .range(["#f1eef6", "#bdc9e1", "#74a9cf", "#2b8cbe", "#045a8d"]);

var projection = d3.geo.mercator()
    .scale(2200)
    .translate([w - 1760, h + 1405]);

var path = d3.geo.path()
    .projection(projection);

d3.json("dataPPI.json", function(data) {

    color.domain([
        d3.min(data, function(d) {
            return d.Populasi;
        }),
        d3.max(data, function(d, i) {
            return d.Populasi;
        })
    ]);

    var pieData = [
        { "label": "Humaniora", "value": 12 },
        { "label": "Bahasa", "value": 15 },
        { "label": "Saintek", "value": 10 },
        { "label": "Bahasa", "value": 13 },
        { "label": "Bahasa", "value": 14 },
    ]

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

    var pathPie = d3.svg.arc()
        .outerRadius(pieR - 10)
        .innerRadius(0);

    var labelPie = d3.svg.arc()
        .outerRadius(pieR - 40)
        .innerRadius(pieR - 40);

    d3.json("tr-topo-prop.json", function(error, json) {

        for (var i = 0; i < data.length; i++) {
            var dataProvince = data[i].Nama.toLowerCase();

            var dataValue = parseFloat(data[i].Populasi);
            // console.log(dataValue);

            var rumpunHumaniora = data[i].Rumpun["Humaniora"];
            var rumpunAgama = data[i].Rumpun["Agama"];
            var rumpunBahasa = data[i].Rumpun["Bahasa"];
            var rumpunPendidikan = data[i].Rumpun["Pendidikan"];
            var rumpunTOMER = data[i].Rumpun["Tomer"];
            var rumpunSaintek = data[i].Rumpun["Saintek"];

            var jurusanNamaFirst = data[i].Jurusan[0].Nama;
            var jurusanNamaSecond = data[i].Jurusan[1].Nama;
            var jurusanNamaThird = data[i].Jurusan[2].Nama;

            var univNamaFirst = data[i]["Mahasiswa Terbanyak"][0].Univ;
            var univNamaSecond = data[i]["Mahasiswa Terbanyak"][1].Univ;
            var univNamaThird = data[i]["Mahasiswa Terbanyak"][2].Univ;

            var jurusanPopulasiFirst = parseInt(data[i].Jurusan[0].Populasi / data[i].Populasi * 100);
            var jurusanPopulasiSecond = parseInt(data[i].Jurusan[1].Populasi / data[i].Populasi * 100);
            var jurusanPopulasiThird = parseInt(data[i].Jurusan[2].Populasi / data[i].Populasi * 100);

            var univPopulasiFirst = parseInt(data[i]["Mahasiswa Terbanyak"][0].Populasi / data[i].Populasi * 100);
            var univPopulasiSecond = parseInt(data[i]["Mahasiswa Terbanyak"][1].Populasi / data[i].Populasi * 100);
            var univPopulasiThird = parseInt(data[i]["Mahasiswa Terbanyak"][2].Populasi / data[i].Populasi * 100);

            var totalLaki = parseFloat(data[i].Gender["L"]);
            var totalPuan = parseFloat(data[i].Gender["P"]);

            var ratioLaki = parseInt(data[i].Gender["L"] / (data[i].Gender["P"] + data[i].Gender["L"]) * 100 || 0);

            var ratioPuan = parseInt(data[i].Gender["P"] / (data[i].Gender["P"] + data[i].Gender["L"]) * 100 || 0);

            var jsonFeatures = topojson.feature(json, json.objects.tr).features;

            for (var j = 0; j < jsonFeatures.length; j++) {
                if (jsonFeatures[j].properties.ad == null) {
                    continue;
                } else {
                    var jsonProvince = jsonFeatures[j].properties.ad
                }

                if (dataProvince == jsonProvince.toLowerCase()) {
                    jsonFeatures[j].properties.population = dataValue;


                    jsonFeatures[j].properties.totalLaki = totalLaki;
                    jsonFeatures[j].properties.totalPuan = totalPuan;
                    jsonFeatures[j].properties.ratioPuan = ratioPuan;
                    jsonFeatures[j].properties.ratioLaki = ratioLaki;


                    jsonFeatures[j].properties.JNF = jurusanNamaFirst;
                    jsonFeatures[j].properties.JNS = jurusanNamaSecond;
                    jsonFeatures[j].properties.JNT = jurusanNamaThird;

                    jsonFeatures[j].properties.UNF = univNamaFirst;
                    jsonFeatures[j].properties.UNS = univNamaSecond;
                    jsonFeatures[j].properties.UNT = univNamaThird;

                    jsonFeatures[j].properties.JPF = jurusanPopulasiFirst;
                    jsonFeatures[j].properties.JPS = jurusanPopulasiSecond;
                    jsonFeatures[j].properties.JPT = jurusanPopulasiThird;

                    jsonFeatures[j].properties.UPF = univPopulasiFirst;
                    jsonFeatures[j].properties.UPS = univPopulasiSecond;
                    jsonFeatures[j].properties.UPT = univPopulasiThird;

                    jsonFeatures[j].properties.rHum = rumpunHumaniora;
                    jsonFeatures[j].properties.rSai = rumpunSaintek;
                    jsonFeatures[j].properties.rBah = rumpunBahasa;
                    jsonFeatures[j].properties.rAga = rumpunAgama;
                    jsonFeatures[j].properties.rTom = rumpunTOMER;
                    jsonFeatures[j].properties.rPen = rumpunPendidikan;

                    break;
                }
            }

        }

        var arc = gPie.selectAll(".arc")
            .data(pie(pieData))
            .enter()
            .append("g")
            .attr("class", "arc");
        // .attr("id", function(d) {
        //     return d.Nama;
        // });

        // console.log(pie(data));
        arc.append("path")
            .attr("d", pathPie)
            .attr("fill", function(d, i) {
                return color(i);
            });

        arc.append("text")
            .attr("transform", function(d) { return "translate(" + pathPie.centroid(d) + ")"; })
            .style("text-anchor", "middle")
            .text(function(d, i) { return pieData[i].label; })
            .attr("font-size", "11px");

        // arc.append("text")
        //     .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
        //     .attr("dy", "0.35em")
        //     .text(function(d) { return d.Populasi; });

        svg.selectAll(".province")
            .data(jsonFeatures)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "province")
            .attr("id", function(d) {
                return d.properties.ad;
            })
            .style("fill", function(d) {
                var value = d.properties.population;

                if (value) {
                    return color(value);
                } else {
                    return "#ccc";
                }
            })
            .style("stroke", "white")
            .on("mouseover", function(d) {
                var coordinates = [0, 0]
                coordinates = d3.mouse(this);
                var x = coordinates[0];
                var y = coordinates[1];

                d3.select("#tooltip")
                    // .style("left", x + "px")
                    .style("left", x + 60 + "px")
                    .style("top", y + 60 + "px")
                    .select("#provinceName")
                    .text(d.properties.ad)

                // d3.select("#value")
                //     .text(function(){
                //         if (!d.properties.PPh) {
                //             return 0;
                //         } else {
                //             return d.properties.PPh;
                //         }
                //     });


                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function() {
                d3.select("#tooltip")
                    .classed("hidden", true);
            })
            .on("click", function(d) {
                d3.select("#stats-name")
                    .transition()
                    .duration(500)
                    .style("transform", "scale(1.1,1.1)")
                    .text(d.properties.ad)

                var value = d.properties.population;

                d3.select("#stats-population")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(value));

                var valueTotalLaki = d.properties.totalLaki;
                var valueRatioLaki = d.properties.ratioLaki;
                var valueTotalPuan = d.properties.totalPuan;
                var valueRatioPuan = d.properties.ratioPuan;

                d3.select("#stats-gender-laki")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueTotalLaki));

                d3.select("#stats-gender-puan")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueTotalPuan));

                d3.select("#stats-gender-puan-persen")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRatioPuan));

                d3.select("#stats-gender-laki-persen")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRatioLaki));


                var valueJNF = d.properties.JNF;
                var valueJNS = d.properties.JNS;
                var valueJNT = d.properties.JNT;

                d3.select("#stats-major-most-1")
                    .text(function() {
                        if (valueJNF == "-" || valueJNS == undefined) {
                            return "Tidak ada data";
                        } else {
                            return valueJNF;
                        }
                    });

                d3.select("#stats-major-most-2")
                    .text(function() {
                        if (valueJNS == "-" || valueJNS == undefined) {
                            return "Tidak ada data";
                        } else {
                            return valueJNS;
                        }
                    });

                d3.select("#stats-major-most-3")
                    .text(function() {
                        if (valueJNT == "-" || valueJNS == undefined) {
                            return "Tidak ada data";
                        } else {
                            return valueJNT;
                        }
                    });

                var valueUNF = d.properties.UNF;
                var valueUNS = d.properties.UNS;
                var valueUNT = d.properties.UNT;

                d3.select("#stats-uni-most-1")
                    .text(function() {
                        if (valueUNF == "-" || valueUNS == undefined) {
                            return "Tidak ada data";
                        } else {
                            return valueUNF;
                        }
                    });

                d3.select("#stats-uni-most-2")
                    .text(function() {
                        if (valueUNS == "-" || valueUNS == undefined) {
                            return "Tidak ada data";
                        } else {
                            return valueUNS;
                        }
                    });

                d3.select("#stats-uni-most-3")
                    .text(function() {
                        if (valueUNT == "-" || valueUNS == undefined) {
                            return "Tidak ada data";
                        } else {
                            return valueUNT;
                        }
                    });


                var valueJPF = d.properties.JPF;
                var valueJPS = d.properties.JPS;
                var valueJPT = d.properties.JPT;

                d3.select("#stats-major-most-1-population")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueJPF));

                d3.select("#stats-major-most-2-population")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueJPS));

                d3.select("#stats-major-most-3-population")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueJPT));

                var valueUPF = d.properties.UPF;
                var valueUPS = d.properties.UPS;
                var valueUPT = d.properties.UPT;

                d3.select("#stats-uni-most-1-population")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueUPF));

                d3.select("#stats-uni-most-2-population")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueUPS));

                d3.select("#stats-uni-most-3-population")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueUPT));


                var valueRHum = d.properties.rHum;
                var valueRAga = d.properties.rAga;
                var valueRSai = d.properties.rSai;
                var valueRPen = d.properties.rPen;
                var valueRTom = d.properties.rTom;
                var valueRBah = d.properties.rBah;

                var valueRHumPercent = parseInt(valueRHum / value * 100 || 0);
                var valueRAgaPercent = parseInt(valueRAga / value * 100 || 0);
                var valueRSaiPercent = parseInt(valueRSai / value * 100 || 0);
                var valueRPenPercent = parseInt(valueRPen / value * 100 || 0);
                var valueRTomPercent = parseInt(valueRTom / value * 100 || 0);
                var valueRBahPercent = parseInt(valueRBah / value * 100 || 0);



                maxRumpun = d3.max([valueRHum, valueRAga, valueRSai, valueRPen, valueRTom, valueRBah]);

                d3.select("#stats-rumpun-hum")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRHum));

                if ((valueRHum == maxRumpun) && (valueRHum != undefined) && (valueRHum > 0)) {
                    d3.select("#stats-hum")
                        .transition()
                        .duration(1000)
                        .style("color", "#f4f465")
                        .style("font-weight", "bold");
                } else {
                    // console.log("Test");
                    d3.select("#stats-hum")
                        .style("color", "white")
                        .style("font-weight", "normal");
                }

                d3.select("#stats-rumpun-hum-percent")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRHumPercent));

                d3.select("#stats-rumpun-aga")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRAga));

                if ((valueRAga == maxRumpun) && (valueRAga != undefined) && (valueRAga > 0)) {
                    d3.select("#stats-agama")
                        .transition()
                        .duration(1000)
                        .style("color", "#f4f465")
                        .style("font-weight", "bold");
                } else {
                    // console.log("Test");
                    d3.select("#stats-agama")
                        .style("color", "white")
                        .style("font-weight", "normal");
                }

                d3.select("#stats-rumpun-aga-percent")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRAgaPercent));

                d3.select("#stats-rumpun-sai")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRSai));

                if ((valueRSai == maxRumpun) && (valueRSai != undefined) && (valueRSai > 0)) {
                    // console.log(valueRSai);
                    d3.select("#stats-saintek")
                        .transition()
                        .duration(1000)
                        .style("color", "#f4f465")
                        .style("font-weight", "bold");
                } else {
                    // console.log("Test");
                    d3.select("#stats-saintek")
                        .style("color", "white")
                        .style("font-weight", "normal");
                }

                d3.select("#stats-rumpun-sai-percent")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRSaiPercent));

                d3.select("#stats-rumpun-pen")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRPen));

                if ((valueRPen == maxRumpun) && (valueRPen != undefined) && (valueRPen > 0)) {
                    d3.select("#stats-pendidikan")
                        .transition()
                        .duration(1000)
                        .style("color", "#f4f465")
                        .style("font-weight", "bold");
                } else {
                    // console.log("Test");
                    d3.select("#stats-pendidikan")
                        .style("color", "white")
                        .style("font-weight", "normal");
                }

                d3.select("#stats-rumpun-pen-percent")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRPenPercent));

                d3.select("#stats-rumpun-bah")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRBah));

                if ((valueRBah == maxRumpun) && (valueRBah != undefined) && (valueRBah > 0)) {
                    d3.select("#stats-bahasa")
                        .transition()
                        .duration(1000)
                        .style("color", "#f4f465")
                        .style("font-weight", "bold");
                } else {
                    // console.log("Test");
                    d3.select("#stats-bahasa")
                        .style("color", "white")
                        .style("font-weight", "normal");
                }

                d3.select("#stats-rumpun-bah-percent")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRBahPercent));

                d3.select("#stats-rumpun-tom")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRTom));

                if ((valueRTom == maxRumpun) && (valueRTom != undefined) && (valueRTom > 0)) {
                    d3.select("#stats-TOMER")
                        .transition()
                        .duration(1000)
                        .style("color", "#f4f465")
                        .style("font-weight", "bold");
                } else {
                    // console.log("Test");
                    d3.select("#stats-TOMER")
                        .style("color", "white")
                        .style("font-weight", "normal");
                }

                d3.select("#stats-rumpun-tom-percent")
                    .transition()
                    .duration(1000)
                    .tween('text', tweenText(valueRTomPercent));

                function tweenText(newValue) {
                    return function() {
                        if (newValue == undefined) {
                            newValue = 0;
                        }

                        if (currentValue == NaN) {
                            newValue = 0;
                            // console.log(newValue);
                        }
                        var currentValue = +this.textContent;

                        var i = d3.interpolateRound(currentValue, newValue);

                        return function(t) {
                            this.textContent = i(t);
                        };
                    }
                }
            });
        // .on("click", function(d) {
        //     d3.selectAll(".province")
        //         .transition()
        //         .duration(1000)
        //         .style("fill", "#ccc");

        //     d3.select(this)
        //         .transition()
        //         .duration(1000)
        //         .style("fill", color(d.properties.PPh));
        // });

        d3.select("#show-uni-location")
            .on("click", function() {
                uniCord();
            });

        d3.select("#viz-by-saintek")
            .on("click", function() {
                // console.log("Test")
                svg.selectAll(".province")
                    .transition()
                    .duration(1000)
                    // .data(jsonFeatures)
                    // .enter()
                    // .append("path")
                    // .attr("d", path)
                    // .attr("class", "province")
                    .style("fill", function(d) {
                        // console.log("Test")
                        var value = d.properties.rSai;

                        if (value) {
                            return color(value);
                        } else {
                            return "#ccc";
                        }
                    });
            });

        d3.select("#viz-by-humaniora")
            .on("click", function() {
                // console.log("Test")
                svg.selectAll(".province")
                    .transition()
                    .duration(1000)
                    // .data(jsonFeatures)
                    // .enter()
                    // .append("path")
                    // .attr("d", path)
                    // .attr("class", "province")
                    .style("fill", function(d) {
                        // console.log("Test")
                        var value = d.properties.rHum;

                        if (value) {
                            return color(value);
                        } else {
                            return "#ccc";
                        }
                    });
            });

        d3.select("#viz-by-pendidikan")
            .on("click", function() {
                // console.log("Test")
                svg.selectAll(".province")
                    .transition()
                    .duration(1000)
                    // .data(jsonFeatures)
                    // .enter()
                    // .append("path")
                    // .attr("d", path)
                    // .attr("class", "province")
                    .style("fill", function(d) {
                        // console.log("Test")
                        var value = d.properties.rPen;

                        if (value) {
                            return color(value);
                        } else {
                            return "#ccc";
                        }
                    });
            });

        d3.select("#viz-by-bahasa")
            .on("click", function() {
                // console.log("Test")
                svg.selectAll(".province")
                    .transition()
                    .duration(1000)
                    // .data(jsonFeatures)
                    // .enter()
                    // .append("path")
                    // .attr("d", path)
                    // .attr("class", "province")
                    .style("fill", function(d) {
                        // console.log("Test")
                        var value = d.properties.rBah;

                        if (value) {
                            return color(value);
                        } else {
                            return "#ccc";
                        }
                    });
            });

        d3.select("#viz-by-tomer")
            .on("click", function() {
                // console.log("Test")
                svg.selectAll(".province")
                    .transition()
                    .duration(1000)
                    // .data(jsonFeatures)
                    // .enter()
                    // .append("path")
                    // .attr("d", path)
                    // .attr("class", "province")
                    .style("fill", function(d) {
                        // console.log("Test")
                        var value = d.properties.rTom;

                        if (value) {
                            return color(value);
                        } else {
                            return "#ccc";
                        }
                    });
            });

        d3.select("#viz-by-all")
            .on("click", function() {
                // console.log("Test")
                svg.selectAll(".province")
                    .transition()
                    .duration(1000)
                    // .data(jsonFeatures)
                    // .enter()
                    // .append("path")
                    // .attr("d", path)
                    // .attr("class", "province")
                    .style("fill", function(d) {
                        // console.log("Test")
                        var value = d.properties.population;

                        if (value) {
                            return color(value);
                        } else {
                            return "#ccc";
                        }
                    });
            });

        d3.select("#viz-by-ratioPuan")
            .on("click", function() {
                // console.log("Test")
                svg.selectAll(".province")
                    .transition()
                    .duration(1000)
                    // .data(jsonFeatures)
                    // .enter()
                    // .append("path")
                    // .attr("d", path)
                    // .attr("class", "province")
                    .style("fill", function(d) {
                        // console.log("Test")
                        var value = d.properties.ratioPuan;

                        if (value) {
                            return colorWoman(value);
                        } else {
                            return "#ccc";
                        }
                    });
            });

        d3.select("#viz-by-ratioLaki")
            .on("click", function() {
                // console.log("Test")
                svg.selectAll(".province")
                    .transition()
                    .duration(1000)
                    // .data(jsonFeatures)
                    // .enter()
                    // .append("path")
                    // .attr("d", path)
                    // .attr("class", "province")
                    .style("fill", function(d) {
                        // console.log("Test")
                        var value = d.properties.ratioLaki;

                        if (value) {
                            return colorMan(value);
                        } else {
                            return "#ccc";
                        }
                    });
            });
    });
});

function uniCord() {
    d3.csv("uni_coord.csv", function(data) {
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .style("fill", "white")
            .transition()
            .duration(2000)
            .attr("cx", function(d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", function(d) {
                return Math.sqrt(parseInt(d.population) * 4);
            })
            .style("fill", "white")
            .style("opacity", 0.5)
            .on("mouseover", function(d) {

                var coordinates = [0, 0]
                coordinates = d3.mouse(this);
                var x = coordinates[0];
                var y = coordinates[1];

                d3.select("#tooltip")
                    // .style("left", x + "px")
                    .style("left", x + 20 + "px")
                    .style("top", y + 60 + "px")
                    .select("#provinceName")
                    .text(d.name);

                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function() {
                d3.select("#tooltip")
                    .classed("hidden", true);
            })
    });
}

d3.select("#close-button")
    .on("click", function() {
        console.log("Test");
        d3.select("#welcome-note")
            .style("display", "none");
    });