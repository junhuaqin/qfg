angular.module('app.services', [])

.factory('SaleService', [function(){
  var sale = {curMonth:123456.00, curDay:321};
  var saleDetail = [{date:new Date(),totalPrice:1200,items:[{sale:"sq",title:"高压锅",price:4200,count:1}]},
  {date:new Date(),totalPrice:1300,items:[{sale:"lq",title:"高压锅",price:4200,count:1},{sale:"hy",title:"高压锅xxxxx",price:4200,count:1}]}];
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
        saleItems.totalPrice += saleItem.price*saleItem.count;
    },
    clearAll : function() {
        saleItems.totalPrice = 0;
        saleItems.items.splice(0, saleItems.items.length);
    },
    remove : function(saleItem) {
        saleItems.totalPrice -= saleItem.price*saleItem.count;
        saleItems.items.splice(saleItems.items.indexOf(saleItem), 1);
    },
    getDetail : function(from, to) {
        return saleDetail;
    }
  };
}])

.service('StoreService', [function(){
  var products = [{code:123, title:"高压锅", count:12},
  {code:124, title:"炒锅", count:10},
  {code:125, title:"纤巧套", count:1},
  {code:126, title:"雪影12件套", count:2}];

  return {
    getStore : function() {
      return products;
    }
  };
}]);

