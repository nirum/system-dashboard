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
            $scope.usage = data;
            $scope.memory = [{
               "key": "Memory",
               "values": data
            }];
        })
        .error(function (err) {
            console.log('Error!' + err);
        });

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
