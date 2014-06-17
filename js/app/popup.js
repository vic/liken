angular.module('liken.chrome', [])

.service('MessageService', [function () {
  var service = function (message, callback, self)  {
     chrome.tabs.query({active: true}, function (tabs) { 
       if(tabs.length > 0) {
         var tab = tabs[0];
         console.log("send msg ", tab.id, message)
         chrome.tabs.sendMessage(tab.id, message, function () {
           console.log("responsded ", tab.id)
           var args = [tab].concat(Array.prototype.slice.apply(arguments));
           callback.apply(self, args)
         }); 
       }
     })
  }
  return service 
}])

.controller("PopupController", ['$scope', '$templateCache', 'MessageService', function ($scope, $templ, $msg) {
   $msg({action: 'init', template: $templ.get("liken-popup")}, function (tab, response) {
   })
}]);
