App = Ember.Application.create();

App.Router.map(function() {
  this.resource('home');
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  },
  actions: {
    login: function auth() {
      var config = {
        'client_id': '724598683708.apps.googleusercontent.com',
        'scope': 'https://www.googleapis.com/auth/tasks'
      };
      that = this;
      gapi.auth.authorize(config, function() {
        that.transitionTo('home')
      });
    }
  }
});

function printTaskLists(json) {
  console.log(json);
}

function getListsOfTasks() {
  gapi.client.request({
    'path': '/tasks/v1/users/@me/lists',
    'callback': printTaskLists
  });
}

