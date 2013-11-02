App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  }
});

App.IndexController = Ember.Controller.extend({
  login: function () {
    console.log('clicked');
  }
})

function printTaskLists(json) {
  console.log(json);
}

function getListsOfTasks() {
  gapi.client.request({
    'path': '/tasks/v1/users/@me/lists',
    'callback': printTaskLists
  });
}

function auth() {
  var config = {
    'client_id': '724598683708.apps.googleusercontent.com',
    'scope': 'https://www.googleapis.com/auth/tasks'
  };
  gapi.auth.authorize(config, function() {
  });
}

