angular.module('app.services', [])

.service('SaleService', function(BackgroundService){
//  var saleDetail = [{date:new Date(),totalPrice:1200,items:[{sale:"sq",title:"高压锅",unitPrice:4200,count:1}]}];
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
        var postItem = angular.copy(saleItems);
        postItem.totalPrice *= 100;
        angular.forEach(postItem.items, function(item) {
          item.unitPrice *= 100;
        });

        BackgroundService.post("/orders/add", postItem)
              .success(function(response) {
                  sucCallBack(response);
              })
              .error(errCallBack);
    };

  this.getDetail = function(from, to, sucCallBack, errCallBack) {
        BackgroundService.get("/orders/"+from.getTime()+"/"+to.getTime())
           .success(function(response) {
              var saleDetail = [];

              angular.forEach(response, function(order){
                var orderItems = [];
                angular.forEach(order.items, function(oi){
                  oi.unitPrice /= 100;
                  orderItems.push({sale:order.sale,
                                   title:oi.title,
                                   unitPrice:oi.unitPrice,
                                   count:oi.count});
                });

                var sdItem = {date:new Date(order.createdAt),
                              totalPrice:order.totalPrice/100,
                              items:orderItems};

                var bFind = false;
                for (var i = 0; i < saleDetail.length; i++) {
                  if (saleDetail[i].date == sdItem.date) {
                    saleDetail[i].totalPrice += sdItem.totalPrice;
                    saleDetail[i].items.concat(sdItem.items);
                    bFind = true;
                    break;
                  }
                }

                if (!bFind) {
                  saleDetail.push(sdItem);
                }
              });

              sucCallBack(saleDetail);
           })
           .error(errCallBack);
    };
})

.service('ProductService', function(BackgroundService){
/*  var products = [{barCode:123, title:"高压锅", unitPrice:4200, left:12}];*/

  this.getStore = function(sucCallBack, errCallBack) {
      BackgroundService.get("/products", { cache: true })
           .success(function(response) {
              angular.forEach(response, function(product){
                product.unitPrice /= 100;
              });
              sucCallBack(response);
           })
           .error(errCallBack);
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
})

.service('BackgroundService', function($http, backend){
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
})

.service('UtilService', function($ionicPopup, $ionicLoading) {
  this.showResult = function(message, success) {
    var temp = '<a class="item-icon-left">'
    if (success) {
      temp += '<i class="icon ion-checkmark-round positive"></i>'+message+'</a>';
    } else {
      temp += '<i class="icon ion-android-close assertive"></i>'+message+'</a>'
    }

    $ionicPopup.alert({
                       title:'提示',
                       template:temp
                     });
  };

  this.httpFailed = function(data,status){
    if (400 == status) {
      this.showResult(data, false);
    } else if (404 == status) {
      this.showResult("内部错误", false);
    } else if (0 == status) {
      this.showResult("连接服务器失败", false);
    }else {
      this.showResult("未知错误", false);
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

