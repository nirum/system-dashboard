// Controller
app.controller('SystemCtrl', function ($scope, $interval, $http) {

    $http.get('/api/system')
        .success(function (data) {
            $scope.os = data;
            $scope.os.cpus = _.map($scope.os.cpus, function(cpu) {
                cpu.times = _.pairs(cpu.times);
                return cpu;
            });
        })
        .error(function (err) {
            console.log('Error!' + err);
        });

    function refreshData() {
        $http.get('/api/system/memory')
            .success(function (data) {
                $scope.memory = Math.round(data.fracmem * 10000) / 100;

                bounds = [0.3, 0.5, 0.7, 0.9, 1];
                if (data.fracmem < bounds[0]) {
                    $scope.memoryClass = 'success';
                } else if (data.fracmem < bounds[1]) {
                    $scope.memoryClass = 'primary';
                } else if (data.fracmem < bounds[2]) {
                    $scope.memoryClass = 'info';
                } else if (data.fracmem < bounds[3]) {
                    $scope.memoryClass = 'warning';
                } else {
                    $scope.memoryClass = 'danger';
                };
            })
            .error(function (err) {
                console.log('Error!' + err);
            });
    };

    $interval(refreshData, 500);

    $http.get('/api/process')
        .success(function (data) {
            $scope.processes = _.pairs(data);
        })
        .error(function (err) {
            console.log('Error!' + err);
        });

    $scope.selected = {};
    $scope.newRadio = function () {
        console.log('update plot: ' + $scope.selected.pid)
        var margin = {top: 20, right: 20, bottom: 30, left: 75},
            w = 960,
            h = 500;

        memUsage($scope.selected.pid, margin, w, h);
        function wrapper() {
            memUsage($scope.selected.pid, margin, w, h);
        }
        $interval(wrapper, 1000);
    };

    var humanFileSize = function(bytes, si) {
        var thresh = si ? 1000 : 1024;
        if(bytes < thresh) return bytes + ' B';
        var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while(bytes >= thresh);
        return bytes.toFixed(1)+' '+units[u];
    };

    var humanDate = function (date) {
        return moment(date).format("h:mm:ss");
    };

    // line chart
    var memUsage = function (pid, margin, w, h) {
        d3.json('/api/process/' + pid, function (data) {

            var width = w - margin.left - margin.right,
                height = h - margin.top - margin.bottom;

            var parseTime = d3.time.format.iso.parse;

            // Scales
            var x = d3.time.scale()
                .range([0,width])
                .domain(d3.extent(data, function(d) { return parseTime(d.time); }));
            var y = d3.scale.linear()
                .range([height,0])
                .domain(d3.extent(data, function(d) { return d.memory; }));

            // Axes
            var xAxis = d3.svg.axis()
                .scale(x)
                .tickFormat(function(d) { return humanDate(d); })
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .scale(y)
                .tickFormat(function(d) {return humanFileSize(d, true);})
                .orient("left");

            var line = d3.svg.line()
                .x(function(d) {return x(parseTime(d.time));})
                .y(function(d) {return y(d.memory);});

            d3.select("#memoryChart").html("");

            var svg = d3.select("#memoryChart")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 10)
                    .attr("x", -10)
                    .attr("dy", "0.71em")
                    .style("text-anchor", "end")
                    .style("font-size", "24px")
                    .text("Memory usage");

            svg.append("g")
                .attr("class", "x axis")
                .call(xAxis)
                .attr("transform", "translate(0," + height + ")");

            svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line);

        });
    };

    // system pie charts
    $scope.pie = {};
    $scope.pie.xfun = function(){
        return function(d) {
            return d[0];
        };
    };
    $scope.pie.yfun = function(){
        return function(d){
            return d[1] / (1000 * 3600); // hours
        };
    };

    var colors = d3.scale.category10();
    $scope.pie.color = function() {
        return function(d, i) {
            return colors(i);
        };
    };
});
