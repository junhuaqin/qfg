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

  .state('tabs.saleItem', {
    url: '/saleItem',
    views: {
      'sales': {
        templateUrl: 'templates/saleItem.html',
        controller: 'saleItemCtrl'
      }
    }
  })

  .state('tabs.saleShow', {
      url: '/sales/:from/:to',
      views: {
        'sales': {
          templateUrl: 'templates/saleShow.html',
          controller: 'saleShowCtrl'
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

  .state('tabs.productItem', {
    url: '/productItem',
    views: {
      'stores': {
        templateUrl: 'templates/productItem.html',
        controller: 'editProductCtrl'
      }
    }
  })

  .state('tabs.purchases', {
    url: '/purchases',
    views: {
      'purchases': {
        templateUrl: 'templates/purchaseTab.html',
        controller: 'purchaseTabCtrl'
      }
    }
  })

  .state('tabs.purchaseDetail', {
    url: '/purchaseDetail',
    views: {
      'purchases': {
        templateUrl: 'templates/purchaseDetail.html',
        controller: 'purchaseDetailCtrl'
      }
    }
  })

  .state('tabs.purchaseItem', {
    url: '/purchaseItem',
    views: {
      'purchases': {
        templateUrl: 'templates/purchaseItem.html',
        controller: 'purchaseItemCtrl'
      }
    }
  })

  .state('tabs.purchaseOrder', {
    url: '/purchaseOrder',
    views: {
      'purchases': {
        templateUrl: 'templates/purchaseOrder.html',
        controller: 'purchaseOrderCtrl'
      }
    }
  })

  .state('tabs.account', {
    url: '/account',
    views: {
      'account': {
        templateUrl: 'templates/accountTab.html',
        controller: 'accountTabCtrl'
      }
    }
  })

  .state('tabs.modifyPassword', {
    url: '/modifyPassword',
    views: {
      'account': {
        templateUrl: 'templates/modifyPassword.html',
        controller: 'modifyPasswordCtrl'
      }
    }
  })

  .state('tabs', {
    url: '/tabs',
    templateUrl: 'templates/tabs.html',
    abstract:true
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

$urlRouterProvider.otherwise('/login')



});
