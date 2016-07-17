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
//        $http.get("http://www.tbh.cn/wechat/index.php?app=product&act=product&code=111224140833")
        var formData = new FormData();
        formData.append("act", "get_product_by_unique_code");
        formData.append("unique_code", 111224140833);
        $http({
          method : 'POST',
          url  : 'http://www.tbh.cn/member_api/product.php',
          data : formData,
          headers : {'Content-Type': 'application/x-www-form-urlencoded'},
//          transformRequest: function (data) {
//
//                return formData;
//              },
          transformResponse: function (cnv) {
                return JSON.parse(cnv);
              }
        })
        .success(function(data) {
          alert(data);
          alert(data.info.product_code);
        })
        .error(function(data) {
          alert("error:"+data);
        });
//        $cordovaBarcodeScanner.scan().then(function(imageData) {
//            alert(imageData.text);
//
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
