angular.module('app.services', [])

.service('SaleService', function(BackgroundService){
//  var saleDetail = [{date:new Date(),totalPrice:1200,items:[{sale:"sq", createdAt:"", totalPrice:1200, items:[{title:"高压锅",unitPrice:4200,count:1}]}]];
  var saleItems = {
  totalPrice:0,
  items:[]
  };

  this.getSaleStatics = function(sucCallBack, errCallBack) {
        BackgroundService.get("/orders/statics")
             .success(function(response) {
                response.curMonth /= 100;
                response.curDay /= 100;
                sucCallBack(response);
             })
             .error(errCallBack);
    };

  this.saleItems = function() {
        return saleItems;
    };

  this.putSaleItem = function(saleItem) {
        var bFind = false;
        for (var i = 0; i < saleItems.items.length; i++) {
          if ((saleItems.items[i].barCode == saleItem.barCode)
              && (saleItems.items[i].unitPrice == saleItem.unitPrice)){
            saleItems.items[i].count += saleItem.count;
            bFind = true;
            break;
          }
        }

        if(!bFind) {
          saleItems.items.push(saleItem);
        }

        saleItems.totalPrice += saleItem.unitPrice*saleItem.count;
    };

  this.clearAll = function() {
        saleItems.totalPrice = 0;
        saleItems.items.splice(0, saleItems.items.length);
    };

  this.remove = function(saleItem) {
        saleItems.totalPrice -= saleItem.unitPrice*saleItem.count;
        saleItems.items.splice(saleItems.items.indexOf(saleItem), 1);
    };

  this.submitSaleItems = function(sucCallBack, errCallBack) {
        if (saleItems.length <= 0) {
          return;
        }

        var postItem = angular.copy(saleItems);
        postItem.totalPrice *= 100;
        angular.forEach(postItem.items, function(item) {
          item.unitPrice *= 100;
        });

        BackgroundService.post("/orders", postItem)
              .success(function(response) {
                  sucCallBack(response);
              })
              .error(errCallBack);
    };

  this.getDetail = function(from, to, sucCallBack, errCallBack) {
        var saleDetail = [];
        putIntoSaleDetail = function(order) {
          var vdate = (angular.copy(order.createdAt)).setHours(0,0,0,0);
          var bFind = false;
          for (var i = 0; i < saleDetail.length; i++) {
            if (saleDetail[i].date == vdate) {
              saleDetail[i].totalPrice += order.totalPrice;
              saleDetail[i].items.push(order);
              bFind = true;
              break;
            }
          }

          if (!bFind) {
            saleDetail.push({date:vdate, totalPrice:order.totalPrice, items:[order]});
          }
        };

        BackgroundService.get("/orders/"+from.getTime()+"/"+to.getTime())
           .success(function(response) {
              angular.forEach(response, function(order){
                order.totalPrice /= 100;
                order.createdAt = new Date(order.createdAt);
                angular.forEach(order.items, function(oi){
                  oi.unitPrice /= 100;
                });

                putIntoSaleDetail(order);
              });

              sucCallBack(saleDetail);
           })
           .error(errCallBack);
    };
})

.service('ProductService', function(BackgroundService){
  var products = [];

  this.getStore = function(sucCallBack, errCallBack, force) {
      var len= arguments.length;

      if ((!force) && (products.length > 0)) {
        sucCallBack(products);
      } else {
        BackgroundService.get("/products")
           .success(function(response) {
              angular.forEach(response, function(product){
                product.unitPrice /= 100;
              });
              products = response;
              sucCallBack(products);
           })
           .error(errCallBack);
      }
  };

  this.getStoreByQR = function(qrCode, sucCallBack, errCallBack) {
      if (angular.isDefined(qrCode) && (!(null === qrCode)) && ("" != qrCode)){
            BackgroundService.get("/products/qr/"+qrCode, { cache: true })
               .success(function(response) {
                  response.unitPrice /= 100;
                  sucCallBack(response);
               })
               .error(errCallBack);
      }
  };

  this.addProduct = function(product, sucCallBack, errCallBack) {
      product.unitPrice *= 100;
      BackgroundService.post("/products", product)
        .success(function(response) {
            response.unitPrice /= 100;
            products.push(response);
            sucCallBack(response);
        })
        .error(errCallBack);
  };

  this.updateProduct = function(product, sucCallBack, errCallBack) {
        product.unitPrice *= 100;
        BackgroundService.put("/products/"+product.barCode, product)
          .success(function(response) {
              response.unitPrice /= 100;
              product.unitPrice /= 100;
              sucCallBack(response);
          })
          .error(errCallBack);
  };

  this.deleteProduct = function(product, sucCallBack, errCallBack) {
      BackgroundService.delete("/products/"+product.barCode)
        .success(function(response) {
            products.splice(products.indexOf(product), 1);
            sucCallBack(response);
        })
        .error(errCallBack);
  };

  var editProduct = {barCode:"", title:"", unitPrice:0, left:0};
  this.setEditProduct = function(product) {
      editProduct = product;
  };

  this.getEditProduct = function() {
    return editProduct;
  };

  this.clearEditProduct = function() {
    editProduct = {barCode:"", title:"", unitPrice:0, left:0};
  }

  this.hasEditProduct = function() {
    return editProduct.barCode.length != 0;
  };
})

.service('AccountService', function(BackgroundService, locals){
  var is_admin = false;
  saveAccount = function(user, password) {
    locals.setObject("account", {userName:user, password:password});
    BackgroundService.setAuth(user, password);
  };

  this.login = function(user, password, sucCallBack, errCallBack) {
    BackgroundService.post("/users/login", {userName:user, password:password})
        .success(function(response) {
            saveAccount(user, password);
            is_admin = (response.roleId == 1);
            sucCallBack(response);
        })
        .error(errCallBack);
  };

  this.attemptLogin = function(sucCallBack, errCallBack) {
    var loginUser = locals.getObject("account");
    if (angular.isDefined(loginUser.userName)) {
        this.login(loginUser.userName, loginUser.password, sucCallBack, errCallBack);
    } else {
        errCallBack("unauthorized");
    }
  };

  this.getCurrentUser = function() {
    return locals.getObject("account");
  };

  this.logout = function() {
    locals.setObject("account",{});
    BackgroundService.setAuth("", "");
  };

  this.isAdmin = function() {
    return is_admin;
  };

  this.changePassword = function(user, password, newPassword, sucCallBack, errCallBack) {
    BackgroundService.put("/users/changePassword", {userName:user, password:password, newPassword:newPassword})
        .success(function(response) {
            saveAccount(user, newPassword);
            sucCallBack(response);
        })
        .error(errCallBack);
  };
})

.service('PurchaseService', function($q, BackgroundService){
  var purchases = [];
  this.getPurchases = function() {
    return $q(function(resolve, reject) {
      BackgroundService.get("/purchases")
      .success(function(response) {
        angular.forEach(response, function(purchase){
          purchase.totalPrice /= 100;
        });
        purchases = response;
        resolve(purchases);
      })
    });
  };

  var showDetailPurchase;
  this.setShowDetailPurchase = function(purchase) {
    showDetailPurchase = purchase;
  };

  this.getShowDetailPurchase = function() {
    return showDetailPurchase;
  };

  this.isNewPurchase = function() {
    return !showDetailPurchase.id;
  };

  this.getPurchaseById = function(id) {
    return $q(function(resolve, reject) {
      BackgroundService.get("/purchases/"+id)
        .success(function(response) {
                  response.totalPrice /= 100;
                  angular.forEach(response.items, function(item){
                            item.unitPrice /= 100;
                  });
                  resolve(response);
        })
        .error(reject)
    });
  };

  this.submitPurchase = function(purchase) {
    return $q(function(resolve, reject) {
      angular.forEach(purchase.items, function(item){
                item.unitPrice *= 100;
      });

      BackgroundService.post("/purchases", purchase)
        .success(function(response) {
                  response.totalPrice /= 100;
                  purchases.push(response);
                  resolve(response);
        })
        .error(reject);
    });
  };

  this.remove = function(purchase, sucCallBack, errCallBack) {
    BackgroundService.delete("/purchases/"+purchase.id)
        .success(function(response) {
                  purchases.splice(purchases.indexOf(purchase));
                  sucCallBack(response);
        })
        .error(errCallBack);
  };

  this.getPurchaseItems = function(id, sucCallBack, errCallBack) {
    BackgroundService.get("/purchases/"+id+"/allItems")
      .success(function(response) {
                sucCallBack(response);
      })
      .error(errCallBack);
  };

  this.getPurchaseConfirms = function(id, sucCallBack, errCallBack) {
    BackgroundService.get("/purchases/"+id+"/allConfirms")
      .success(function(response) {
                sucCallBack(response);
      })
      .error(errCallBack);
  };

  this.confirm = function(id, count, sucCallBack, errCallBack) {
    BackgroundService.post("/purchases/"+id+"/confirm", {amount:count})
      .success(function(response) {
                sucCallBack(response);
      })
      .error(errCallBack);
  };

  this.deleteItem = function(purchase, item, sucCallBack, errCallBack) {
    BackgroundService.delete("/purchases/"+purchase.id+"/deleteItem/"+item.id)
        .success(function(response) {
                  sucCallBack(item);
        })
        .error(errCallBack);
  };

  this.addItem = function(purchase, item, sucCallBack, errCallBack) {
    item.unitPrice *= 100;
    BackgroundService.post("/purchases/"+purchase.id+"/addItem", item)
        .success(function(response) {
                  response.unitPrice /= 100;
                  sucCallBack(response);
        })
        .error(errCallBack);
  };
})

.service('BackgroundService', function($http, backend){
  this.setAuth = function(userName, password) {
    $http.defaults.headers.common.Authorization = userName+":"+password;
  };

  this.get = function() {
    var len= arguments.length;
    if(len == 2) {
      return $http.get(backend+arguments[0], arguments[1]);
    } else {
      return $http.get(backend+arguments[0]);
    }
  };

  this.post = function(url, data) {
    return $http.post(backend+url, data);
  };

  this.put = function(url, data) {
    return $http.put(backend+url, data);
  };

  this.delete = function(url) {
    return $http.delete(backend+url);
  };
})

.service('UtilService', function($ionicPopup, $ionicLoading, $cordovaToast) {
  this.showResult = function(message, success) {
    if (success) {
//      this.toast(message);
      this.alert(message);
    } else {
      this.alert(message);
    }
  };

  this.httpFailed = function(data,status){
    if (401 == status || 403 == status) {
    } else if (400 == status) {
      this.showResult(data.err, false);
    } else if (404 == status) {
      this.showResult("内部错误", false);
    } else if (0 == status) {
      this.showResult("连接服务器失败", false);
    }else {
      this.showResult("未知错误:"+status, false);
    }
  };

  this.showLoading = function() {
    $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
  };

  this.hideLoading = function() {
    $ionicLoading.hide();
  };

  this.confirm = function(msg) {
    return $ionicPopup.confirm({
                      title: '确认',
                      template: msg
           });
  };

  this.alert = function(msg) {
    return $ionicPopup.alert({
                          title: '提示',
                          template: msg
            });
  };

  this.toast = function(msg) {
    $cordovaToast.showLongCenter(msg);
  };
})

.service('locals', function($window){
  //存入单个属性
  this.set = function(key,value){
    $window.localStorage[key]=value;
  };

  //读取单个属性
  this.get = function(key,defaultValue){
    return  $window.localStorage[key] || defaultValue;
  };

  //存储对象，以JSON格式存储
  this.setObject = function(key, value){
    $window.localStorage[key]=JSON.stringify(value);
  };

  //读取对象
  this.getObject = function(key) {
    return JSON.parse($window.localStorage[key] || '{}');
  };
});

