angular.module('app.services', [])

.service('SaleService', function($http, backend){
  var sale = {curMonth:123456.00, curDay:321};
  var saleDetail = [{date:new Date(),totalPrice:1200,items:[{sale:"sq",title:"高压锅",unitPrice:4200,count:1}]},
  {date:new Date(),totalPrice:1300,items:[{sale:"lq",title:"高压锅",unitPrice:4200,count:1},{sale:"hy",title:"高压锅xxxxx",unitPrice:4200,count:1}]}];
  var saleItems = {
  totalPrice:0,
  items:[]
  };

  this.getSaleStatics = function(sucCallBack) {
        $http.get(backend+"/orders/statics")
             .success(function(response) {
                response.curMonth /= 100;
                response.curDay /= 100;
                sucCallBack(response);
             });
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

  this.submitSaleItems = function(sucCallBack) {
        var postItem = angular.copy(saleItems);
        postItem.totalPrice *= 100;
        angular.forEach(postItem.items, function(item) {
          item.unitPrice *= 100;
        });

        $http.post(backend+"/orders/add", postItem)
              .success(function(response) {
                  sucCallBack(response);
              });
    };

  this.getDetail = function(from, to, sucCallBack) {
        $http.get(backend+"/orders/"+from.getTime()+"/"+to.getTime())
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
                                      totalPrice:order.totalPrice,
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
                   });
    };
})

.service('ProductService', function($http, backend){
/*  var products = [{barCode:123, title:"高压锅", unitPrice:4200, left:12}];*/

  this.getStore = function(sucCallBack) {
      $http.get(backend+"/products", { cache: true })
           .success(function(response) {
              angular.forEach(response, function(product){
                product.unitPrice /= 100;
              });
              sucCallBack(response);
           });
  };

  this.getStoreByQR = function(qrCode, sucCallBack) {
      if (angular.isDefined(qrCode) && (!(null === qrCode)) && ("" != qrCode)){
          $http.get(backend+"/products/qr/"+qrCode, { cache: true })
               .success(function(response) {
                  response.unitPrice /= 100;
                  sucCallBack(response);
               });
      }
  };
});

