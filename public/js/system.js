// Controller
app.controller('SystemCtrl', function ($scope, $http) {
    $http.get('/api/system')
        .success(function (data) {
            $scope.os = data;
            $scope.os.memory = Math.round($scope.os.fracmem * 10000) / 100;
            $scope.os.cpus = _.map($scope.os.cpus, function(cpu) {
                cpu.times = _.pairs(cpu.times);
                return cpu;
            });
        })
        .error(function (err) {
            console.log('Error!' + err);
        });

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
        memUsage($scope.selected.pid, '#memoryChart', 800, 200, 20);
    };
    $scope.line = {};
    $scope.line.yfun = function () {
        return function (d) {
            return d.memory;  // Megabytes
        }
    };
    $scope.line.xfun = function () {
        return function (d) {
            return moment(d.time).unix();
        }
    };
    $scope.line.xticks = function () {
        return function (d) {
            return moment.unix(d).format('h:mm:ss');
        };
    };
    $scope.line.yticks = function () {
        return function (d) {
            return humanFileSize(d, true);
        }
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

    // line chart
    var memUsage = function (pid, chartid, w, h, pad) {
        d3.json('/api/process/' + pid, function (data) {

            var iso = d3.time.format.iso;
            console.log(iso.parse(data[0].time));

            var svg = d3.select(chartid)
                .attr("width", w)
                .attr("height", h);

            var x = d3.time.scale()
                .range([pad, w-pad])
                .domain(d3.extent(data, function(d) { return iso.parse(d.time); }))

            var y = d3.scale.linear()
                .range([h-pad, pad])
                .domain(d3.extent(data, function(d) { return d.memory; }));

            var circles = svg.selectAll("circle").data(data)

            circles.enter()
                .append("circle")
                .attr("r", 1)
                .attr("cx", function(d) {return x(iso.parse(d.time)); })
                .attr("cy", function(d) {return y(d.memory);})
            circles.transition()
                .attr("cx", function(d) {return x(iso.parse(d.time)); })
                .attr("cy", function(d) {return y(d.memory);})
                .attr("fill", "red")
            circles.exit().remove();

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
