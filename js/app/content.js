var liken = angular.module('liken', ['firebase'])

.service('MessageService', [function (){
  var msg = function () {}
  chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    msg[request.action].apply(msg, arguments)
  })
  return msg
}])

.controller('MainController', ['$scope', 'MessageService', '$firebase',  function ($scope, $msg, $firebase) {
  var mask = $('<div>', {class: 'liken-select'}).appendTo('body')

  var ref = new Firebase("https://liken.firebaseio.com/public");
  var pageRef = ref.child(window.location.host.replace(/\W+/g, '_') + (window.location.pathname || "/").replace(/[^\/\w]+/g, '_'))
  var liken_ref = null 

  $scope.title = document.title
  $scope.fields = $firebase(pageRef.child('fields'))
  $scope.fields.$bind($scope, 'fields')
 

  $scope.collapsed = true
  $scope.collapsed_icon = "[+]"
  $scope.toggle = function (show) {
    $scope.collapsed = typeof show == 'undefined' ? !$scope.collapsed : show
    $scope.collapsed_icon = $scope.collapsed ? "[+]" : "[-]"
  }

  $scope.addField = function (event) {
    event.stopPropagation()
    var field = {name: "Name", xpath: "", value: "Value"}
    $scope.fields.$add(field).then(function (x) {
      liken_ref = pageRef.child(x.path.m.slice(-1)[0]) 
      var liken_srv = $firebase(liken_ref)
      $scope.selField(field, event)
    })
    $scope.toggle(true)
  }

  $scope.selField = function (field, event) {
    event.stopPropagation()
    console.log("Selecting ", field)
    $('body').addClass('liken-select').data('liken-select', field)
  }

  $(document).on('click mouseup', 'body.liken-select *', function (e) {
    if(!$(e.target).is('#liken,#liken *')) {
      e.preventDefault()
      e.stopPropagation() 
      var field = $('body').removeClass('liken-select').data('liken-select')
      $scope.$apply(function() {
        field.value = $(e.target).text() 
        field.xpath = getXPath(e.target)
        $scope.toggle(false)
      })
    }
  })

  $(document).on('mouseenter', 'body.liken-select *', function (e) {
    if(!$(e.target).is('#liken,#liken *')) {
      $('.liken-select-hover').removeClass('liken-select-hover')
      mask.addClass('liken-select-hover').css($(e.target).offset()).css({
        position: 'absolute',
        width: $(e.target).outerWidth(),
        height: $(e.target).outerHeight()
      })
    }
  })

}])

angular.element(document).ready(function () {
  var injector = angular.injector(['ng'])
  injector.invoke(['$http', function($http){
    var url = chrome.extension.getURL("view/index.html") 
    $http.get(url).then(function (res) {
      var div = angular.element(res.data)[0]
      document.body.appendChild(div)
      angular.bootstrap(div, ['liken'])
    })
  }])
})

function getXPath( element ) {
  var xpath = '';
  for ( ; element && element.nodeType == 1; element = element.parentNode ) {
    var id = $(element.parentNode).children(element.tagName).index(element) + 1;
    id > 1 ? (id = '[' + id + ']') : (id = '');
    xpath = '/' + element.tagName.toLowerCase() + id + xpath;
  }
  return xpath;
}
