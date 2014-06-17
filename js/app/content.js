var liken = angular.module('liken', ['firebase'])

/*
.service('MessageService', [function (){
  var msg = function () {}
  chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    msg[request.action].apply(msg, arguments)
  })
  return msg
}])
*/

.controller('MainController', ['$scope', '$firebase',  function ($scope, $firebase) {
  var mask = $('<div>', {class: 'liken-select'}).appendTo('body')

  var ref = new Firebase("https://liken.firebaseio.com/");
  var pageRef = ref.child(window.location.host.replace(/\W+/g, '_') + window.location.pathname.replace(/\W+/g, '_'))
  var fldsRef = pageRef.child('fields')
  var liken_ref = null 


  $scope.title = document.title
  $scope.fields = $firebase(fldsRef)

  $scope.collapsed = true
  $scope.selecting_field = null
  $scope.toggle = function (show) {
    $scope.collapsed = typeof show === 'undefined' ? !$scope.collapsed : show
  }

  $scope.addField = function (event) {
    event.stopPropagation()
    $scope.toggle(true)
    $scope.fields.$add({label: "", xpath: "", value: ""}).then(function (ref) {
      $scope.selField({id: ref.name()}, event)
      ref.update({id: ref.name()})
    })
  }

  $scope.updateField = function (field) {
    $scope.fields.$child(field.id).$update(field)
  }

  $scope.delField = function (field) {
    $scope.fields.$child(field.id).$remove()
  }

  $scope.selField = function (field, event) {
    event.stopPropagation()
    $scope.selecting_field = field
    $('body').addClass('liken-select')
  }

  $(document).on('click', 'body.liken-select *', function (e) {
    if(!$(e.target).is('#liken,#liken *')) {
      e.preventDefault()
      e.stopPropagation() 
      $('body').removeClass('liken-select')
      var field_id = $scope.selecting_field.id
      $scope.$apply(function() {
        $scope.toggle(false)
        $scope.selecting_field = null
        $scope.updateField({
          id: field_id,
          value: $(e.target).text(),
          xpath: getXPath(e.target)
        })
      })
      $("[data-id='"+field_id+"'] [ng-model='field.label']").focus()
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

angular.element(document).ready(boot)

function boot () {
  var injector = angular.injector(['ng'])
  injector.invoke(['$http', function($http){
    var url = chrome.extension.getURL("view/index.html") 
    $http.get(url).then(function (res) {
      var div = angular.element(res.data)[0]
      document.body.appendChild(div)
      angular.bootstrap(div, ['liken'])
    })
  }])
}

function getXPath( element ) {
  var xpath = '';
  for ( ; element && element.nodeType == 1; element = element.parentNode ) {
    var id = $(element.parentNode).children(element.tagName).index(element) + 1;
    id > 1 ? (id = '[' + id + ']') : (id = '');
    xpath = '/' + element.tagName.toLowerCase() + id + xpath;
  }
  return xpath;
}
