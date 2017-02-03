angular.module('app.controllers', [])
.controller('AppCtrl', function($scope, $state, UtilService, AUTH_EVENTS) {

  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    UtilService.alert('无权访问改资源');
  });

  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    $state.go('login');
  });
})

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

    failedRefreshStatics = function(data, status) {
      UtilService.httpFailed(data, status);
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.refreshSaleStatics = function() {
      SaleService.getSaleStatics()
      .then(function(saleStatics) {
        $scope.sale = saleStatics;
      })
      .catch(function(data, status) {
        UtilService.httpFailed(data, status);
      })
      .finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.refreshSaleStatics();

    $scope.addSaleItem = function() {
        $state.go('tabs.saleItem');
    };

    $scope.submitSaleItems = function() {
      UtilService.showLoading();
      SaleService.submitSaleItems()
      .then(function(response) {
        SaleService.clearAll();
        UtilService.showResult("提交成功", true);
        $scope.refreshSaleStatics();
      })
      .catch(function(data, status){
        UtilService.httpFailed(data, status);
      })
      .finally(function() {
        UtilService.hideLoading();
      });
    };
})

.controller('storeTabCtrl', function($scope, $state, AccountService, ProductService, UtilService) {
    $scope.isAdmin = function() {
      return AccountService.isAdmin();
    };

    $scope.refreshStores = function(force) {
      UtilService.showLoading();
      ProductService.getStore(force)
      .then(function(products) {
        $scope.products = products;
      })
      .catch(function(data, status) {
        UtilService.hideLoading();
        UtilService.httpFailed(data, status);
      })
      .finally(function() {
        UtilService.hideLoading();
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.refreshStores(false);

    $scope.addProduct = function() {
        ProductService.clearEditProduct();
        $state.go('tabs.productItem');
    };

    $scope.editProduct = function(product) {
        ProductService.setEditProduct(product);
        $state.go('tabs.productItem');
    };

    $scope.deleteProduct = function(product) {
      UtilService.confirm('确定要删除该产品吗?')
      .then(function(res) {
           if(res) {
             UtilService.showLoading();
             ProductService.deleteProduct(product)
             .catch(function(data, status) {
               UtilService.httpFailed(data, status);
             })
             .finally(function() {
               UtilService.hideLoading();
             });
           }
      });
    };
})

.controller('accountTabCtrl', function($scope, $state, AccountService) {
  $scope.logout = function() {
    AccountService.logout();
    $state.go('login');
  };

  $scope.modifyPassword = function() {
    $state.go('tabs.modifyPassword');
  };
})

.controller('modifyPasswordCtrl', function($scope, $state, UtilService, AccountService) {
  $scope.changePassword = function(password, newPassword) {
    UtilService.showLoading();
    AccountService.changePassword(AccountService.getCurrentUser().userName, password, newPassword)
    .then(function() {
      UtilService.showResult("修改成功", true);
    })
    .catch(function(data, status) {
      if (401 == status) {
        UtilService.showResult("用户名或者密码错误", false);
      } else {
        UtilService.httpFailed(data, status);
      }
    })
    .finally(function() {
      UtilService.hideLoading();
    });
  };
})

.controller('saleItemCtrl', function($scope, $state, $cordovaBarcodeScanner, SaleService, ProductService, UtilService) {
    $scope.descriptions = [];

    $scope.refreshProducts = function() {
      UtilService.showLoading();
      ProductService.getStore(false)
      .then(function(products) {
        $scope.stores = products;
        angular.forEach(products, function(product){
          $scope.descriptions.push(product.barCode+"-"+product.title);
        });
      })
      .catch(function(data, status) {
        UtilService.httpFailed(data, status);
      })
      .finally(function() {
        UtilService.hideLoading();
      });
    };

    $scope.refreshProducts();

    $scope.selectedProduct = {barCode:"", title:"", unitPrice:0, count:1};
    $scope.selectedStore = {selected:""};

    $scope.verifyProduct = function(product) {
      return (product.barCode.length > 0)
           &&(product.title.length > 0)
           &&(product.unitPrice != null)
           &&(product.unitPrice >= 0)
           &&(product.count > 0);
    };

    $scope.putItem = function() {
      if (!$scope.verifyProduct($scope.selectedProduct)) {
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

    $scope.scanBarcode = function() {
//        var imageData = {text:"http://www.tbh.cn/member/product/111224140834"};//111224140833
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if ((!imageData.text) || (!imageData.text.length)) {
              return;
            }

            var index = imageData.text.lastIndexOf('/');
            if (index < 0) {
              alert("无效码:"+imageData.text);
              return;
            }

            UtilService.showLoading();
            ProductService.getStoreByQR(imageData.text.substr(index+1))
            .then(function(product) {
              if (!product) {
                UtilService.alert("未找到产品信息");
              } else {
                $scope.selectedStore.selected = product.barCode+"-"+product.title;
              }
            })
            .catch(function(data, status) {
              UtilService.httpFailed(data, status);
            }).finally(function() {
              UtilService.hideLoading();
            });
        }, function(error) {
            alert("扫码失败: " + error);
        });
    };
})

.controller('saleShowCtrl', function($scope, $stateParams, UtilService, SaleService) {
    $scope.getDetail = function(from, to) {
      from.setHours(0,0,0,0);
      to.setHours(23,59,59,0);
      UtilService.showLoading();
      SaleService.getDetail(from, to)
      .then(function(saleDetail) {
        $scope.saleDetail = saleDetail;
      })
      .catch(function(data, status) {
        UtilService.httpFailed(data, status);
      })
      .finally(function() {
        UtilService.hideLoading();
      });
    };

    $scope.from = new Date($stateParams.from);
    $scope.to = new Date($stateParams.to)

    $scope.getDetail($scope.from, $scope.to);
})

.controller('loginCtrl', function($scope, $state, UtilService, AccountService) {
    $scope.attemptLogin = function() {
        UtilService.showLoading();
        AccountService.attemptLogin()
        .then(function() {
            $state.go('tabs.sales');
        })
        .finally(function() {
          UtilService.hideLoading();
        });
    };

    $scope.attemptLogin();

    $scope.login = function(userName, password) {
      UtilService.showLoading();
      AccountService.login(userName, password)
      .then(function() {
          $state.go('tabs.sales');
      })
      .catch(function(data, status) {
        UtilService.hideLoading();
        if (401 == status) {
           UtilService.showResult("用户名或者密码错误", false);
        } else {
           UtilService.httpFailed(data, status);
        }
      })
      .finally(function() {
        UtilService.hideLoading();
      });
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

    $scope.verifyProduct = function(product) {
      return (product.barCode.length > 0)
           &&(product.title.length > 0)
           &&(product.unitPrice > 0)
           &&(product.left != null)
           &&(product.left >= 0);
    };

    $scope.saveProduct = function(product) {
        if (!$scope.verifyProduct(product)) {
          UtilService.alert("请输入正确的产品信息");
        } else {
          UtilService.showLoading();
          var promise;
          if ($scope.hasEditProduct) {
              promise = ProductService.updateProduct(product);
          } else {
              promise = ProductService.addProduct(product);
          }

          promise.then(function(product) {
            UtilService.showResult("提交成功", true);
            $state.go('tabs.stores');
          })
          .catch(function(data, status) {
            UtilService.httpFailed(data, status);
          }).finally(function() {
            UtilService.hideLoading();
          });
        }
    };
})

.controller('purchaseTabCtrl', function($scope, $state, UtilService, AccountService, PurchaseService) {
  $scope.isAdmin = function() {
    return AccountService.isAdmin();
  };

  $scope.loadPurchase = function() {
    UtilService.showLoading();
    PurchaseService.getPurchases()
    .then(function(purchases) {
      $scope.purchases = purchases;
    })
    .catch(function(data, status) {
      UtilService.httpFailed(data, status);
    }).finally(function() {
      UtilService.hideLoading();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.loadPurchase();

  $scope.showDetail = function(purchase) {
    PurchaseService.setShowDetailPurchase(purchase);
    $state.go('tabs.purchaseDetail');
  };

  $scope.addPurchase = function() {
    $state.go('tabs.purchaseOrder');
  };

  $scope.remove = function(purchase) {
    UtilService.confirm('确定要删除该进货单吗?')
      .then(function(res) {
        if(res) {
          UtilService.showLoading();
          PurchaseService.remove(purchase)
          .catch(function(data, status) {
            UtilService.httpFailed(data, status);
          })
          .finally(function() {
            UtilService.hideLoading();
          });
        }
      });
  };
})

.controller('purchaseDetailCtrl', function($scope, $ionicPopup, $state, UtilService, AccountService, PurchaseService) {
  $scope.purchase = PurchaseService.getShowDetailPurchase();
  $scope.isAdmin = function() {
    return AccountService.isAdmin();
  };

  $scope.loadDetail = function() {
    UtilService.showLoading();
    PurchaseService.getPurchaseById($scope.purchase.id)
    .then(function(purchase) {
      $scope.purchase.amount = purchase.amount;
      $scope.purchase.amountConfirmed = purchase.amountConfirmed;
      $scope.purchase.totalPrice = purchase.totalPrice;
      $scope.purchase.items = purchase.items;
    })
    .catch(function(data, status) {
      UtilService.httpFailed(data, status);
    })
    .finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
      UtilService.hideLoading();
    });
  };

  $scope.loadDetail();

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
        PurchaseService.confirm(item, res)
        .then(function(confirmed) {
          item.amountConfirmed += confirmed.amount;
          item.confirms.push(confirmed);
          $scope.purchase.amountConfirmed += confirmed.amount;
        })
        .catch(function(data, status) {
          UtilService.httpFailed(data, status);
        })
        .finally(function() {
          UtilService.hideLoading();
        });
      }
    });
  };

  $scope.deleteItem = function(item) {
    UtilService.confirm('确定要删除该产品吗?')
      .then(function(res) {
        if(res) {
          UtilService.showLoading();
          PurchaseService.deleteItem($scope.purchase, item)
          .then(function(item) {
            UtilService.hideLoading();
            $scope.purchase.amount -= item.amount;
            $scope.purchase.totalPrice -= item.amount*(item.unitPrice*100)/100;
            $scope.purchase.items.splice($scope.purchase.items.indexOf(item), 1);
          }).catch(function(data, status) {
            UtilService.httpFailed(data, status);
          })
          .finally(function() {
            UtilService.hideLoading();
          });
        }
    });
  };

  $scope.addItem = function() {
    $state.go('tabs.purchaseItem');
  };

  $scope.editItem = function(item) {
    $scope.itemData = {unitPrice:item.unitPrice, amount:item.amount};
    var myPopup = $ionicPopup.show({
      template: '<p>进价:<input type="number" ng-model="itemData.unitPrice"></p>' +
                '<p>数量<input type="number" ng-model="itemData.amount"></p>',
      title: '请输入',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>OK</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.itemData.amount || $scope.itemData.amount < 0
                || !$scope.itemData.unitPrice || $scope.itemData.unitPrice < 0) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return 1;
            }
          }
        }
      ]
    });

    myPopup.then(function(res) {
      if (res) {
        PurchaseService.updateItem(item, $scope.itemData)
        .then(function(updatedItem) {
          $scope.purchase.amount -= item.amount;
          $scope.purchase.amount += updatedItem.amount;
          $scope.purchase.totalPrice -= item.amount*item.unitPrice;
          $scope.purchase.totalPrice += updatedItem.amount*updatedItem.unitPrice;

          item.unitPrice = updatedItem.unitPrice;
          item.amount = updatedItem.amount;
        })
        .catch(function(data, status) {
          UtilService.httpFailed(data, status);
        })
        .finally(function() {
          UtilService.hideLoading();
        });
      }
    });
  };
})

.controller('purchaseOrderCtrl', function($scope, $state, $ionicPopup, UtilService, ProductService, PurchaseService, Upload) {
  $scope.addItem = function() {
    $state.go('tabs.purchaseItem');
  };

  $scope.remove = function(item) {
    $scope.purchase.totalPrice -= item.unitPrice*item.amount;
    $scope.purchase.items.splice($scope.purchase.items.indexOf(item), 1);
  };

  $scope.verifyPurchase = function(purchase) {
    return purchase.purchaseOrderId.length
          && purchase.items.length;
  };

  $scope.clearPurchase = function() {
    $scope.purchase = {purchaseOrderId:"", totalPrice:0, items:[]};
    $scope.unknownPurchase = {purchaseOrderId:"", totalPrice:0, items:[]};
    PurchaseService.setShowDetailPurchase($scope.purchase);
  };

  $scope.clearPurchase();

  $scope.submitPurchase = function(purchase) {
      UtilService.showLoading();
      PurchaseService.submitPurchase(purchase)
      .then(function() {
        $scope.clearPurchase();
        UtilService.showResult("提交成功", true);
        $state.go('tabs.purchases');
      })
      .catch(function(data, status) {
         UtilService.httpFailed(data, status);
      })
      .finally(function() {
        UtilService.hideLoading();
      });
  };

  $scope.cancel = function() {
    $scope.clearPurchase();
  };

  $scope.formatPurchase = function(purchase) {
    purchase.totalPrice /= 100;
    angular.forEach(purchase.items, function(product){
                  product.unitPrice /= 100;
    });
  };

  $scope.upload = function(files) {
    if (files && files.length) {
      UtilService.showLoading();
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        Upload.upload({
          url: 'http://52.197.213.21/ctu/v1/purchases/import',//
          fields: {
            'service': 'tbh'
          },
            file: file
          /*}).progress(function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);*/
          }).success(function(data, status, headers, config) {
            //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            $scope.purchase = data.known;
            $scope.formatPurchase($scope.purchase);
            PurchaseService.setShowDetailPurchase($scope.purchase);

            $scope.unknownPurchase = data.unknown;
            $scope.formatPurchase($scope.unknownPurchase);

            UtilService.hideLoading();
          }).error(function(data, status) {
            UtilService.hideLoading();
            UtilService.httpFailed(data, status);
          });
      }
    }
  };

  $scope.removeUnknown = function(item) {
    $scope.unknownPurchase.items.splice($scope.unknownPurchase.items.indexOf(item), 1);
  };

  $scope.addProduct = function(item) {
    $scope.itemData = {unitPrice:item.unitPrice};
    var myPopup = $ionicPopup.show({
      template: '<input type="number" ng-model="itemData.unitPrice">',
      title: '请输入销售单价',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>OK</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.itemData.unitPrice || $scope.itemData.unitPrice < 0) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.itemData.unitPrice;
            }
          }
        }
      ]
    });

    myPopup.then(function(res) {
      if (res) {
        var product = {barCode:item.barCode, title:item.title, unitPrice:res, left:0};
        ProductService.addProduct(product)
        .then(function(product) {
          $scope.unknownPurchase.amount -= item.amount;
          $scope.purchase.amount += item.amount;
          $scope.unknownPurchase.totalPrice -= item.amount*item.unitPrice;
          $scope.purchase.totalPrice += item.amount*item.unitPrice;

          $scope.unknownPurchase.items.splice($scope.unknownPurchase.items.indexOf(item), 1);
          $scope.purchase.items.push(item);
        })
        .catch(function(data, status) {
          UtilService.httpFailed(data, status);
        })
        .finally(function() {
          UtilService.hideLoading();
        });
      }
    });
  };
})

.controller('purchaseItemCtrl', function($scope, $state, UtilService, ProductService, PurchaseService) {
  $scope.descriptions = [];
  $scope.purchase = PurchaseService.getShowDetailPurchase();

  $scope.refreshProducts = function() {
    UtilService.showLoading();
    ProductService.getStore(false)
    .then(function(products) {
      $scope.stores = products;
      angular.forEach(products, function(product){
        $scope.descriptions.push(product.barCode+"-"+product.title);
      });
    })
    .catch(function(data, status) {
       UtilService.httpFailed(data, status);
    })
    .finally(function() {
      UtilService.hideLoading();
    });
  };

  $scope.refreshProducts();

  $scope.discount = {value:58};
  $scope.selectedProduct = {barCode:"", title:"", unitPrice:0, purchasePrice:0, count:1};
  $scope.selectedStore = {selected:""};

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

  $scope.verifyProduct = function(product) {
    return (product.barCode.length > 0)
         &&(product.title.length > 0)
         &&(product.purchasePrice != null)
         &&(product.purchasePrice >= 0)
         &&(product.count > 0);
  };

  $scope.submitAddItem = function(product) {
    var item = {barCode:product.barCode, title:product.title, unitPrice:product.purchasePrice, amount:product.count};
    if (!$scope.verifyProduct(product)) {
      UtilService.alert("请输入正确的产品信息");
    } else if (PurchaseService.isNewPurchase()){
      var bFind = false;
      for (var i = 0; i < $scope.purchase.items.length; i++) {
        if ($scope.purchase.items[i].barCode === item.barCode
        && $scope.purchase.items[i].unitPrice === item.unitPrice) {
          $scope.purchase.items[i].amount += item.amount;
          bFind = true;
          break;
        }
      }

      $scope.purchase.amount += item.amount;
      $scope.purchase.totalPrice += item.amount*(item.unitPrice*100)/100;
      if (!bFind) {
        $scope.purchase.items.push(item);
      }

      $state.go('tabs.purchaseOrder');
    } else {
      for (var i = 0; i < $scope.purchase.items.length; i++) {
        if ($scope.purchase.items[i].barCode === item.barCode
        && $scope.purchase.items[i].unitPrice === item.unitPrice) {
          UtilService.alert('当前添加的产品在进货单中已存在,请直接编辑该产品。')
          return;
        }
      }

      UtilService.showLoading();
      PurchaseService.addItem($scope.purchase, item)
      .then(function(item) {
        UtilService.showResult("提交成功", true);

        $scope.purchase.amount += item.amount;
        $scope.purchase.totalPrice += item.amount*(item.unitPrice*100)/100;
        $scope.purchase.items.push(item);

        $state.go('tabs.purchaseDetail');
      })
      .catch(function(data, status) {
         UtilService.httpFailed(data, status);
      })
      .finally(function() {
        UtilService.hideLoading();
      });
    }
  };
})
