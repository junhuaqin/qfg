angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



  .state('tabs.sales', {
    url: '/sales',
    views: {
      'sales': {
        templateUrl: 'templates/saleTab.html',
        controller: 'saleTabCtrl'
      }
    }
  })

  .state('tabs.stores', {
    url: '/stores',
    views: {
      'stores': {
        templateUrl: 'templates/storeTab.html',
        controller: 'storeTabCtrl'
      }
    }
  })

  .state('tabs.account', {
    url: '/account',
    views: {
      'account': {
        templateUrl: 'templates/accountTab.html',
        controller: 'cloudTabCtrl'
      }
    }
  })

  .state('tabs', {
    url: '/tabs',
    templateUrl: 'templates/tabs.html',
    abstract:true
  })

  .state('tabs.saleItem', {
    url: '/saleitem',
    views: {
      'sales': {
        templateUrl: 'templates/saleItem.html',
        controller: 'saleItemCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/tabs/sales')



});
