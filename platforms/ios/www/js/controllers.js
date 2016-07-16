angular.module('app.controllers', [])

.controller('saleTabCtrl', function($scope, SaleService) {
    $scope.sale = SaleService.getSale();
    $scope.saleItems = SaleService.saleItems();
    $scope.cancel = function() {
        SaleService.clearAll();
    };
    $scope.remove = function(saleItem) {
        SaleService.remove(saleItem);
    };
})

.controller('storeTabCtrl', function($scope) {

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
