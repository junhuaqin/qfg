angular.module('app.controllers', [])

.controller('saleTabCtrl', function($scope, $state, $http, $cordovaBarcodeScanner, SaleService) {
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

    $scope.scanBarcode = function() {
        var imageData = {text:"http://www.tbh.cn/member/product/111224140833"};
        //$cordovaBarcodeScanner.scan().then(function(imageData) {
            //alert(imageData.text);
            var index = imageData.text.lastIndexOf('/');
            if (index < 0) {
              alert("无效码:"+imageData.text);
              return;
            }
            $state.go('tabs.saleItem', {code:imageData.text.substr(index+1)});
//        }, function(error) {
//            alert("扫码失败: " + error);
//        });
    };
})

.controller('storeTabCtrl', function($scope, StoreService) {
    $scope.products = StoreService.getStore();
})

.controller('accountTabCtrl', function($scope) {

})

.controller('saleItemCtrl', function($scope, $state, $stateParams, $http, SaleService, StoreService) {
    $scope.stores = angular.copy(StoreService.getStore());
    $scope.selectedProduct = {code:0, title:"", price:0, count:0};
    $scope.putItem = function() {
        SaleService.putSaleItem(angular.copy($scope.selectedProduct));
        $state.go('tabs.sales');
    };

    $scope.selectedStore = {selected:""};
      $scope.movies = ["123-高压锅",
                       "124-炒锅"];
    $scope.$watch('selectedStore.selected', function() {
      var words = $scope.selectedStore.selected.split('-');
      $scope.selectedProduct.code=parseInt(words[0]);
      $scope.selectedProduct.title=words[1];
    });
})

.controller('saleShowCtrl', function($scope, $stateParams, SaleService) {
    $scope.getDetail = function(from, to) {
        $scope.saleDetail = SaleService.getDetail(from, to);
    };

    $scope.from = new Date($stateParams.from);
    $scope.to = new Date($stateParams.to);
    $scope.getDetail($scope.from, $scope.to);
})
