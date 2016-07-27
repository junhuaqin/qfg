angular.module('app.services', [])

.factory('SaleService', function(){
  var sale = {curMonth:123456.00, curDay:321};
  var saleDetail = [{date:new Date(),totalPrice:1200,items:[{sale:"sq",title:"高压锅",unitPrice:4200,count:1}]},
  {date:new Date(),totalPrice:1300,items:[{sale:"lq",title:"高压锅",unitPrice:4200,count:1},{sale:"hy",title:"高压锅xxxxx",unitPrice:4200,count:1}]}];
  var saleItems = {
  totalPrice:0,
  items:[]
  };

  return {
    getSale : function() {
        return sale;
    },
    saleItems : function() {
        return saleItems;
    },
    putSaleItem : function(saleItem) {
        saleItems.items.push(saleItem);
        saleItems.totalPrice += saleItem.unitPrice*saleItem.count;
    },
    clearAll : function() {
        saleItems.totalPrice = 0;
        saleItems.items.splice(0, saleItems.items.length);
    },
    remove : function(saleItem) {
        saleItems.totalPrice -= saleItem.unitPrice*saleItem.count;
        saleItems.items.splice(saleItems.items.indexOf(saleItem), 1);
    },
    getDetail : function(from, to) {
        return saleDetail;
    }
  };
})

.service('ProductService', function($http, backend){
/*  var products = [{barCode:123, title:"高压锅", unitPrice:4200, left:12}];*/

  this.getStore = function(sucCallBack) {
      $http.get(backend+"/products")
           .success(function(response) {
              angular.forEach(response, function(product){
                product.unitPrice /= 100;
              });
              sucCallBack(response);
           });
  };

  this.getStoreByQR = function(qrCode, sucCallBack) {
      if (angular.isDefined(qrCode) && (!(null === qrCode)) && ("" != qrCode)){
          $http.get(backend+"/products/qr/"+qrCode)
               .success(function(response) {
                  response.unitPrice /= 100;
                  sucCallBack(response);
               });
      }
  };
});

