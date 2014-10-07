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
            console.log('Error!' + err)
        })

    $scope.xfun = function(){
        return function(d) {
            return d[0];
        };
    }
    $scope.yfun = function(){
        return function(d){
            return d[1] / (1000 * 3600); // hours
        };
    }

    var colors = d3.scale.category10();
    $scope.color = function() {
        return function(d, i) {
            return colors(i);
        };
    }
});
