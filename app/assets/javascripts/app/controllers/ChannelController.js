app.controller('ChannelController', ['$rootScope', '$scope', 'Restangular', '$stateParams', 'ngToast', 'Pubnub',
  function($rootScope, $scope, Restangular, $stateParams, ngToast, Pubnub){
    channelId = $stateParams.id
    $scope.newVideo = {}
    Restangular.one("channels", channelId).get().then(function(channel){
      $scope.videos = channel.videos
      $scope.channel = channel
      $scope.playingVideo = _.find($scope.videos, { playing: true })
    })

    // form video
    $scope.video = {
      add: function(video){
        Restangular.one('channels', channelId).all('videos').post({video: video}).then(function(video){

        $scope.newVideo = {}
        ngToast.success('Video added.')

        Pubnub.publish({
          channel: 'playlist',
          message: [video.id, 'add']
        })

        }, function(err){
          ngToast.danger(err.data[0])
        })
      }
    }

    Pubnub.subscribe({
      channel: 'playlist',
      triggerEvents: ['callback']
    })

    $rootScope.$on(Pubnub.getMessageEventNameFor('playlist'), function(ngEvent, msg, evl, channel){
      $scope.$apply(function(){
        Restangular.one("channels", channelId).get().then(function(channel){
          $scope.videos = channel.videos
          $scope.playingVideo = _.find($scope.videos, { playing: true })
        })
      })
    })
  }
]);
