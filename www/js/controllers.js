angular.module('app.controllers', [])

.controller('saleTabCtrl', function($scope, $state, $interval, UtilService, SaleService) {
    $scope.sale = {curDay:0, curMonth:0};
    $scope.today = new Date();
    $scope.monthStart = new Date();
    $scope.monthStart.setDate(1);
    $scope.saleItems = SaleService.saleItems();
    $scope.cancel = function() {
        SaleService.clearAll();
    };

    $scope.remove = function(saleItem) {
        SaleService.remove(saleItem);
    };

    updateSaleStatics = function(saleStatics) {
//      UtilService.hideLoading();
      var mStep = saleStatics.curMonth / 10;
      var tStep = saleStatics.curDay / 10;
      $scope.sale = {curDay:0, curMonth:0};
      $interval(function(){
         $scope.sale.curDay += tStep;
         $scope.sale.curMonth += mStep;
      },100, 10);

      $scope.sale = saleStatics;
      $scope.$broadcast('scroll.refreshComplete');
    };

    failedRefreshStatics = function(data, status) {
//      UtilService.hideLoading();
      UtilService.httpFailed(data, status);
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.refreshSaleStatics = function() {
//      UtilService.showLoading();
      SaleService.getSaleStatics(updateSaleStatics, failedRefreshStatics);
    };

    $scope.refreshSaleStatics();

    $scope.addSaleItem = function() {
        $state.go('tabs.saleItem');
    }

    submitSuccess = function(response) {
      UtilService.hideLoading();
      SaleService.clearAll();
      UtilService.showResult("提交成功", true);
      $scope.refreshSaleStatics();
    };

    submitFailed = function(data, status){
      UtilService.hideLoading();
      UtilService.httpFailed(data, status);
    };

    $scope.submitSaleItems = function() {
      UtilService.showLoading();
      SaleService.submitSaleItems(submitSuccess, submitFailed);
    };
})

.controller('storeTabCtrl', function($scope, ProductService, UtilService) {
    updateStore = function(products) {
      UtilService.hideLoading();
      $scope.products = products;
    };

    failedRefresh = function(data, status) {
      UtilService.hideLoading();
      UtilService.httpFailed(data, status);
    };

    refreshStores = function() {
      UtilService.showLoading();
      ProductService.getStore(updateStore, failedRefresh);
    };

    refreshStores();
})

.controller('accountTabCtrl', function($scope) {

})

.controller('saleItemCtrl', function($scope, $state, $cordovaBarcodeScanner, SaleService, ProductService, UtilService) {
    $scope.descriptions = [];
    updateStore = function(products) {
      UtilService.hideLoading();
      $scope.stores = products;
      angular.forEach(products, function(product){
        $scope.descriptions.push(product.barCode+"-"+product.title);
      });
    };

    failedRefresh = function(data, status) {
      UtilService.hideLoading();
      UtilService.httpFailed(data, status);
    };

    refreshProducts = function() {
      UtilService.showLoading();
      ProductService.getStore(updateStore, failedRefresh);
    };

    refreshProducts();

    $scope.selectedProduct = {barCode:0, title:"", unitPrice:0, count:1};
    $scope.selectedStore = {selected:""};

    updateSelected = function(product) {
      $scope.selectedProduct = product;
      $scope.selectedProduct.count = 1;
      $scope.selectedStore.selected = $scope.selectedProduct.barCode+"-"+$scope.selectedProduct.title;
    };

    $scope.putItem = function() {
        SaleService.putSaleItem(angular.copy($scope.selectedProduct));
        $scope.selectedStore = {selected:""};
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

    $scope.clearSearch = function() {
      $scope.selectedStore.selected = "";
    };

    $scope.scanBarcode = function() {
//        var imageData = {text:"http://www.tbh.cn/member/product/111224140833"};
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            var index = imageData.text.lastIndexOf('/');
            if (index < 0) {
              alert("无效码:"+imageData.text);
              return;
            }
            ProductService.getStoreByQR(imageData.text.substr(index+1), updateSelected);
        }, function(error) {
            alert("扫码失败: " + error);
        });
    };
})

.controller('saleShowCtrl', function($scope, $stateParams, UtilService, SaleService) {
    updateSaleDetail = function(saleDetail) {
      UtilService.hideLoading();
      $scope.saleDetail = saleDetail;
    };

    failedRefresh = function(data, status) {
      UtilService.hideLoading();
      UtilService.httpFailed(data, status);
    };

    $scope.getDetail = function(from, to) {
      from.setHours(0,0,0,0);
      to.setHours(23,59,59,0);
      UtilService.showLoading();
      SaleService.getDetail(from, to, updateSaleDetail, failedRefresh);
    };

    $scope.from = new Date($stateParams.from);
    $scope.to = new Date($stateParams.to)

    $scope.getDetail($scope.from, $scope.to);
})

.controller('loginCtrl', function($scope, $state, UtilService, AccountService) {
    loginSuccess = function() {
        UtilService.hideLoading();
        $state.go('tabs.sales');
    };

    loginFailed = function(data, status) {
        UtilService.hideLoading();
        if (401 == status) {
            UtilService.showResult("用户名或者密码错误", false);
        } else {
            UtilService.httpFailed(data, status);
        }
    };

    attemptFailed = function(data) {
        UtilService.hideLoading();
    };

    attemptLogin = function() {
        UtilService.showLoading();
        AccountService.attemptLogin(loginSuccess, attemptFailed);
    };

    attemptLogin();

    $scope.login = function(userName, password) {
        UtilService.showLoading();
        AccountService.login(userName, password, loginSuccess, loginFailed);
    };
})
