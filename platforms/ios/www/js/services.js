angular.module('app.services', [])

.factory('SaleService', [function(){
  var sale = {curMonth:123456.00, curDay:321};
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
    }
  };
}])

.service('BlankService', [function(){

}]);

