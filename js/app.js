var gapiConfig = {
  'client_id': '724598683708.apps.googleusercontent.com',
  'scope': 'https://www.googleapis.com/auth/tasks',
};

function GoogleLoaded() {
  gapiConfig.immediate = true;
  gapi.auth.authorize(gapiConfig, function() {
    gapiConfig.immediate = false;
    main();
  });
}

var r;
function main() {

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
        that = this;
        gapi.auth.authorize(gapiConfig, function(token) {
          localStorage.setItem("gapi_token", token.access_token);
          that.transitionTo('home')
        });
      }
    }
  });

  App.CustomAdapter = Ember.RESTAdapter.extend({
    ajaxSettings: function(url, method) {
      return {
        url: url,
        type: method,
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("gapi_token"),
        },
        dataType: "json"
      };
    },
    buildURL: function(klass, id) {
      var urlRoot = Ember.get(klass, 'url');
      if (!urlRoot) { throw new Error('Ember.RESTAdapter requires a `url` property to be specified'); }

      if (!Ember.isEmpty(id)) {
        return urlRoot + "/" + id;
      } else {
        return urlRoot;
      }
    },
  });

  App.TaskList = Ember.Model.extend({
    id: Ember.attr(),
    title: Ember.attr(),
  });

  App.TaskList.url = "https://www.googleapis.com/tasks/v1/users/@me/lists";
  App.TaskList.adapter = App.CustomAdapter.create();
  App.TaskList.collectionKey = "items";


  // .create({title: "Title"}).save()


  App.HomeRoute = Ember.Route.extend({
    model: function() {
      return App.TaskList.findAll();
    },
  });

}
