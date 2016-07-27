angular.module('app.services', [])

.factory('SaleService', function(){
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
})

.service('StoreService', function($http, backend){
/*  var products = [{code:123, title:"高压锅", unitPrice:4200, left:12},
  {code:124, title:"炒锅", unitPrice:5800, left:10},
  {code:125, title:"纤巧套", unitPrice:300, left:1},
  {code:126, title:"雪影12件套", unitPrice:2000, left:2}];*/

  this.getStore = function(updateProducts) {
      $http.get(backend+"/products")
           .success(function(response) {updateProducts(response);});
  };
/*
  this.getStore = function() {
      return this.products;
  };*/
})

.factory('ProductService', function(){
  var products = [{code:123, title:"高压锅", price:4200},
  {code:124, title:"炒锅", price:5800},
  {code:125, title:"纤巧套", price:200},
  {code:111224140833, title:"雪影12件套", price:300}];

  return {
    getProduct : function(code) {
      angular.forEach(products, function(data){
        if (data.code == code) {
          return data;
        }
      });
    }
  };
});

