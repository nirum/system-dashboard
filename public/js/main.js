var app = angular.module('dashboard', ['ui.router', 'ui.bootstrap', 'ngResource', 'nvd3ChartDirectives']);

// configure routes
app.config(function ($stateProvider, $urlRouterProvider) {

    // default url (?)
    $urlRouterProvider.otherwise('/');

    // define states
    $stateProvider

        // ------------ system info ------------
        .state('system', {
            url: '/',
            templateUrl: 'views/system.html',
            controller: 'SystemCtrl'
        })

        // ------------ model fits ------------
        .state('fits', {
            url: '/modelfits',
            templateUrl: 'views/fits.html',
            controller: 'ModelCtrl'
        })

        // ------------ test results ------------
        .state('results', {
            url: '/results',
            templateUrl: 'views/results.html',
            controller: 'ResultCtrl'
        })

});

