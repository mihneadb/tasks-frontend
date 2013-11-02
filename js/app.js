App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  }
});


function auth() {
  var config = {
    'client_id': '724598683708.apps.googleusercontent.com',
    'scope': 'https://www.googleapis.com/auth/tasks'
  };
  gapi.auth.authorize(config, function() {
  });
}

