angular.module('app.controllers', [])

.controller('saleTabCtrl', function($scope, $state, $cordovaBarcodeScanner, SaleService) {
    $scope.today = new Date();
    $scope.monthStart = new Date();
    $scope.monthStart.setDate(1);
    $scope.monthStart.setHours(0,0,0,0);
    $scope.saleItems = SaleService.saleItems();
    $scope.cancel = function() {
        SaleService.clearAll();
    };

    $scope.remove = function(saleItem) {
        SaleService.remove(saleItem);
    };

    updateSaleStatics = function(saleStatics) {
      $scope.sale = saleStatics;
    };

    SaleService.getSaleStatics(updateSaleStatics);

    $scope.scanBarcode = function() {
        var imageData = {text:"http://www.tbh.cn/member/product/111224140833"};
//        $cordovaBarcodeScanner.scan().then(function(imageData) {
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

    submitSuccess = function(response) {
      SaleService.clearAll();
      alert("success");
    };

    $scope.submitSaleItems = function() {
      SaleService.submitSaleItems(submitSuccess);
    }
})

.controller('storeTabCtrl', function($scope, ProductService) {
    updateStore = function(products) {
      $scope.products = products;
    };

    ProductService.getStore(updateStore);
})

.controller('accountTabCtrl', function($scope) {

})

.controller('saleItemCtrl', function($scope, $state, $stateParams, $http, SaleService, ProductService) {
    $scope.descriptions = [];
    updateStore = function(products) {
      $scope.stores = products;
      angular.forEach(products, function(product){
        $scope.descriptions.push(product.barCode+"-"+product.title);
      });
    };

    ProductService.getStore(updateStore);

    $scope.selectedProduct = {barCode:0, title:"", unitPrice:0, count:1};
    $scope.selectedStore = {selected:""};

    updateSelected = function(product) {
      $scope.selectedProduct = product;
      $scope.selectedProduct.count = 1;
      $scope.selectedStore.selected = $scope.selectedProduct.barCode+"-"+$scope.selectedProduct.title;
    };

    ProductService.getStoreByQR($stateParams.code, updateSelected);

    $scope.putItem = function() {
        SaleService.putSaleItem(angular.copy($scope.selectedProduct));
        $state.go('tabs.sales');
    };

    $scope.$watch('selectedStore.selected', function() {
      var words = $scope.selectedStore.selected.split('-');
      if($scope.selectedProduct.barCode != words[0]){
          var bFind = false;
          for(var i=0;i<$scope.stores.length;i++){
            if($scope.stores[i].barCode == words[0]) {
              $scope.selectedProduct.barCode = $scope.stores[i].barCode;
              $scope.selectedProduct.title = $scope.stores[i].title;
              $scope.selectedProduct.unitPrice = $scope.stores[i].unitPrice;
              bFind = true;
              break;
            }
          }

          if (!bFind) {
            $scope.selectedProduct = {barCode:0, title:"", unitPrice:0, count:1};
          }
      }
    });
})

.controller('saleShowCtrl', function($scope, $stateParams, SaleService) {
    updateSaleDetail = function(saleDetail) {
      $scope.saleDetail = saleDetail;
    };

    $scope.getDetail = function(from, to) {
        SaleService.getDetail(from, to, updateSaleDetail);
    };

    $scope.from = new Date($stateParams.from);
    $scope.to = new Date($stateParams.to);
    $scope.getDetail($scope.from, $scope.to);
})

.controller('loginCtrl', function($scope, $state, $cordovaDevice) {
    document.addEventListener("deviceready", function () {
      var uuid = $cordovaDevice.getUUID();
      alert(uuid);
    }, false);

    $scope.login = function() {
      $state.go('tabs.sales');
    };
})
