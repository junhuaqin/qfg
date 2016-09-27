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
    };

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

.controller('storeTabCtrl', function($scope, $state, AccountService, ProductService, UtilService) {
    $scope.isAdmin = function() {
      return AccountService.isAdmin();
    };

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

    $scope.addProduct = function() {
        ProductService.clearEditProduct();
        $state.go('tabs.productItem');
    };

    $scope.editProduct = function(product) {
        ProductService.setEditProduct(product);
        $state.go('tabs.productItem');
    };

    deleteSuccess = function(product) {
        UtilService.hideLoading();
    };

    failedDelete = function(data, status) {
      UtilService.hideLoading();
      UtilService.httpFailed(data, status);
    };

    $scope.deleteProduct = function(product) {
      UtilService.confirm('确定要删除该产品吗?')
        .then(function(res) {
             if(res) {
               UtilService.showLoading();
               ProductService.deleteProduct(product, deleteSuccess, failedDelete);
             }
      });
    };
})

.controller('accountTabCtrl', function($scope, $state, AccountService) {
  $scope.logout = function() {
    AccountService.logout();
    $state.go('login');
  };
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

    $scope.selectedProduct = {barCode:"", title:"", unitPrice:0, count:1};
    $scope.selectedStore = {selected:""};

    updateSelected = function(product) {
      if (!product) {
        UtilService.alert("未找到产品信息");
      } else {
        $scope.selectedStore.selected = product.barCode+"-"+product.title;
      }
    };

    verifyProduct = function(product) {
      return (product.barCode.length > 0)
           &&(product.title.length > 0)
           &&(product.unitPrice != null)
           &&(product.unitPrice >= 0)
           &&(product.count > 0);
    };

    $scope.putItem = function() {
      if (!verifyProduct($scope.selectedProduct)) {
        UtilService.alert("请输入正确的产品信息");
      } else {
        SaleService.putSaleItem(angular.copy($scope.selectedProduct));
        $scope.selectedStore = {selected:""};
        $state.go('tabs.sales');
      }
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
            $scope.selectedProduct = {barCode:"", title:"", unitPrice:0, count:1};
          }
      }
    });

    $scope.clearSearch = function() {
      $scope.selectedStore.selected = "";
    };

    failedGetByQR = function(data, status) {
      UtilService.httpFailed(data, status);
    };

    $scope.scanBarcode = function() {
//        var imageData = {text:"http://www.tbh.cn/member/product/111224140834"};//111224140833
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            var index = imageData.text.lastIndexOf('/');
            if (index < 0) {
              alert("无效码:"+imageData.text);
              return;
            }
            ProductService.getStoreByQR(imageData.text.substr(index+1), updateSelected, failedGetByQR);
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

.controller('editProductCtrl', function($scope, $state, UtilService, ProductService) {
    $scope.hasEditProduct = ProductService.hasEditProduct();

    if ($scope.hasEditProduct)
    {
        $scope.product = ProductService.getEditProduct();
    } else {
        $scope.product = {barCode:"", title:"", unitPrice:0, left:0};
    }

    saveProductSuccess = function(product) {
        UtilService.hideLoading();
        UtilService.showResult("提交成功", true);
        $state.go('tabs.stores');
    };

    saveProductFailed = function(data, status) {
        UtilService.hideLoading();
        UtilService.httpFailed(data, status);
    };

    verifyProduct = function(product) {
      return (product.barCode.length > 0)
           &&(product.title.length > 0)
           &&(product.unitPrice > 0)
           &&(product.left != null)
           &&(product.left >= 0);
    };

    $scope.saveProduct = function(product) {
        if (!verifyProduct(product)) {
          UtilService.alert("请输入正确的产品信息");
        } else {
          UtilService.showLoading();
          if (ProductService.hasEditProduct()) {
              ProductService.updateProduct(product, saveProductSuccess, saveProductFailed);
          } else {
              ProductService.addProduct(product, saveProductSuccess, saveProductFailed);
          }
        }
    };
})

.controller('purchaseTabCtrl', function($scope, $state, UtilService, AccountService, PurchaseService) {
  $scope.isAdmin = function() {
    return AccountService.isAdmin();
  };

  loadPurchaseSuccess = function(purchases) {
    $scope.$broadcast('scroll.refreshComplete');
    UtilService.hideLoading();
    $scope.purchases = purchases;
  };

  loadPurchaseFailed = function(data, status) {
    $scope.$broadcast('scroll.refreshComplete');
    UtilService.hideLoading();
    UtilService.httpFailed(data, status);
  };

  $scope.loadPurchase = function() {
    UtilService.showLoading();
    PurchaseService.getPurchases(loadPurchaseSuccess, loadPurchaseFailed);
  };

  $scope.loadPurchase();

  $scope.showDetail = function(purchase) {
    PurchaseService.setShowDetailPurchase(purchase);
    $state.go('tabs.purchaseDetail');
  };

  $scope.addPurchase = function() {
    $state.go('tabs.purchaseOrder');
  };

  removeSuccess = function(response) {
    UtilService.hideLoading();
  };

  removeFailed = function(data, status) {
    UtilService.hideLoading();
    UtilService.httpFailed(data, status);
  };

  $scope.remove = function(purchase) {
    UtilService.confirm('确定要删除该进货单吗?')
      .then(function(res) {
         if(res) {
            UtilService.showLoading();
            PurchaseService.remove(purchase, removeSuccess, removeFailed);
         }
      });
  };
})

.controller('purchaseDetailCtrl', function($scope, $ionicPopup, UtilService, AccountService, PurchaseService) {
  $scope.purchase = PurchaseService.getShowDetailPurchase();
  $scope.isAdmin = function() {
    return AccountService.isAdmin();
  };

  loadDetailSuccess = function(purchase) {
    $scope.$broadcast('scroll.refreshComplete');
    UtilService.hideLoading();
    $scope.purchase.amount = purchase.amount;
    $scope.purchase.amountConfirmed = purchase.amountConfirmed;
    $scope.purchase.totalPrice = purchase.totalPrice;
    $scope.purchase.items = purchase.items;
  };

  loadDetailFailed = function(data, status) {
    $scope.$broadcast('scroll.refreshComplete');
    UtilService.hideLoading();
    UtilService.httpFailed(data, status);
  };

  $scope.loadDetail = function() {
    UtilService.showLoading();
    PurchaseService.getPurchaseById($scope.purchase.id, loadDetailSuccess, loadDetailFailed);
  };

  $scope.loadDetail();

  confirmSuccess = function() {
    UtilService.hideLoading();
    $scope.loadDetail();
  };

  confirmFailed = function(data, status) {
    UtilService.hideLoading();
    UtilService.httpFailed(data, status);
  };

  $scope.confirm = function(item) {
    $scope.data = {};
    var myPopup = $ionicPopup.show({
      template: '<input type="number" ng-model="data.amount">',
      title: '请输入收货数量',
      subTitle: '<div class="assertive">确认后不能修改,请仔细确认数量是否正确。</div>',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>OK</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.amount || $scope.data.amount < 0) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.data.amount;
            }
          }
        }
      ]
    });

    myPopup.then(function(res) {
      if (res) {
        PurchaseService.confirm(item.id, res, confirmSuccess, confirmFailed);
      }
    });
  };

  deleteSuccess = function(item) {
    UtilService.hideLoading();
    $scope.purchase.amount -= item.amount;
    $scope.purchase.totalPrice -= item.amount*(item.unitPrice*100)/100;
    $scope.purchase.items.splice($scope.purchase.items.indexOf(item), 1);
  };

  failedDelete = function(data, status) {
    UtilService.hideLoading();
    UtilService.httpFailed(data, status);
  };

  $scope.deleteItem = function(item) {
    UtilService.confirm('确定要删除该产品吗?')
        .then(function(res) {
             if(res) {
               UtilService.showLoading();
               PurchaseService.deleteItem($scope.purchase, item, deleteSuccess, failedDelete);
             }
      });
  };

})

.controller('purchaseOrderCtrl', function($scope, $state, UtilService, ProductService, PurchaseService) {
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

  $scope.discount = {value:58};
  $scope.selectedProduct = {barCode:"", title:"", unitPrice:0, purchasePrice:0, count:1};
  $scope.selectedStore = {selected:""};

  $scope.verifyProduct = function(product) {
    return (product.barCode.length > 0)
         &&(product.title.length > 0)
         &&(product.unitPrice != null)
         &&(product.unitPrice >= 0)
         &&(product.count > 0);
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
          $scope.selectedProduct.purchasePrice = $scope.selectedProduct.unitPrice*$scope.discount.value/100;
          bFind = true;
          break;
        }
      }

      if (!bFind) {
        $scope.selectedProduct = {barCode:"", title:"", unitPrice:0, purchasePrice:0, count:1};
      }
    }
  });

  $scope.$watch('discount.value', function() {
    $scope.selectedProduct.purchasePrice = $scope.selectedProduct.unitPrice*$scope.discount.value/100;
  });

  $scope.clearSearch = function() {
    $scope.selectedStore.selected = "";
  };

  $scope.addItem = {show:false};
  $scope.showAdd = function() {
    $scope.addItem.show = true;
  };

  $scope.cancelAdd = function() {
    $scope.addItem.show = false;
    $scope.clearSearch();
  };

  $scope.submitAddItem = function(product) {
    $scope.addItem.show = false;
    $scope.purchase.totalPrice += product.purchasePrice*product.count;
    $scope.purchase.items.push({barCode:product.barCode, title:product.title, unitPrice:product.purchasePrice, amount:product.count});
    $scope.clearSearch();
  };

  $scope.purchase = {purchaseOrderId:"", totalPrice:0, items:[]};
  $scope.remove = function(item) {
    $scope.purchase.totalPrice -= item.unitPrice*item.amount;
    $scope.purchase.items.splice($scope.purchase.items.indexOf(item), 1);
  };

  verifyPurchase = function(purchase) {
    return purchase.purchaseOrderId.length
          && purchase.items.length;
  };

  failedSubmit = function(data, status) {
    UtilService.hideLoading();
    UtilService.httpFailed(data, status);
  };

  submitSuccess = function() {
    UtilService.hideLoading();
    $scope.purchase = {purchaseOrderId:"", totalPrice:0, items:[]};
    UtilService.showResult("提交成功", true);
    $state.go('tabs.purchases');
  };

  $scope.submitPurchase = function(purchase) {
    if(!verifyPurchase(purchase)) {
      UtilService.alert('请输入完整信息');
    } else {
      UtilService.showLoading();
      PurchaseService.submitPurchase(purchase, submitSuccess, failedSubmit);
    }
  };
})
