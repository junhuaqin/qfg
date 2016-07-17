angular.module('app.controllers', [])

.controller('saleTabCtrl', function($scope, SaleService) {
    $scope.today = new Date();
    $scope.monthStart = new Date();
    $scope.monthStart.setDate(1);
    $scope.monthStart.setHours(0,0,0,0);
    $scope.sale = SaleService.getSale();
    $scope.saleItems = SaleService.saleItems();
    $scope.cancel = function() {
        SaleService.clearAll();
    };
    $scope.remove = function(saleItem) {
        SaleService.remove(saleItem);
    };
})

.controller('storeTabCtrl', function($scope, StoreService) {
    $scope.products = StoreService.getStore();
})

.controller('accountTabCtrl', function($scope) {

})

.controller('saleItemCtrl', function($scope, $state, SaleService) {
    $scope.saleItemTemp = {code:123,title:"test",price:123,count:1};
    $scope.saleItem = angular.copy($scope.saleItemTemp);
    $scope.putItem = function() {
        SaleService.putSaleItem($scope.saleItem);
        $scope.saleItem = angular.copy($scope.saleItemTemp);
        $state.go('tabs.sales');
    };
})

.controller('saleShowCtrl', function($scope, $stateParams, SaleService) {
    $scope.getDetail = function(from, to) {
        $scope.saleDetail = SaleService.getDetail(from, to);
    };

    $scope.from = new Date($stateParams.from);
    $scope.to = new Date($stateParams.to);
    $scope.getDetail($scope.from, $scope.to);
})
