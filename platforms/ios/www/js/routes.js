angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('tabsController.saleTab', {
    url: '/sales',
    views: {
      'tab1': {
        templateUrl: 'templates/saleTab.html',
        controller: 'saleTabCtrl'
      }
    }
  })

  .state('tabsController.storeTabDefaultPage', {
    url: '/stores',
    views: {
      'tab2': {
        templateUrl: 'templates/storeTabDefaultPage.html',
        controller: 'storeTabDefaultPageCtrl'
      }
    }
  })

  .state('tabsController.cloudTabDefaultPage', {
    url: '/page4',
    views: {
      'tab3': {
        templateUrl: 'templates/cloudTabDefaultPage.html',
        controller: 'cloudTabDefaultPageCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('tabsController.page5', {
    url: '/saleitem',
    views: {
      'tab1': {
        templateUrl: 'templates/page5.html',
        controller: 'page5Ctrl'
      }
    }
  })

$urlRouterProvider.otherwise('/page1/sales')

  

});