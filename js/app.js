// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || this.length;
            position = position - searchString.length;
            var lastIndex = this.lastIndexOf(searchString);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

var gapiConfig = {
    'client_id': '724598683708.apps.googleusercontent.com',
    'scope': 'https://www.googleapis.com/auth/tasks',
};

function GoogleLoaded() {
    var href = window.location.href;
    var host = window.location.host;
    var isIndex = href.substring(0, href.length - 1).endsWith(host);

    if (window.location.pathname === "/" && isIndex) {
        return main();
    }

    gapiConfig.immediate = true;
    gapi.auth.authorize(gapiConfig, function(token) {
        if (token === null) {
            // didn't work, need to relogin
            gapiConfig.immediate = false;
            gapi.auth.authorize(gapiConfig, function(token) {
                // save new token
                localStorage.setItem("gapi_token", token.access_token);
            })
        }
        main();
    });
}

function main() {
    $("#spinner").remove();
    App = Ember.Application.create();

    App.Router.map(function() {
        this.resource('home', function() {
            this.resource("list", { path: ":tasklist_id" });
        });
    });

    App.IndexRoute = Ember.Route.extend({
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

    App.HomeRoute = Ember.Route.extend({
        model: function() {
            return App.TaskList.findAll();
        },
    });

    App.HomeController = Ember.ObjectController.extend({
      newListToggle: false,
      addList: function () {
        this.set('newListToggle', true);
      },
      doneAddingList: function () {
        this.set('newListToggle', false);
      },
        actions: {
            createList: function createList () {
                var input = $('.js-handler--newlistname');
                App.TaskList.create({title: input.val()}).save();
                input.val("");
                this.set('newListToggle', false);
            },
            toggleCreateList: function toggleCreateList () {
              this.set('newListToggle', true);
            },
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
        selfLink: Ember.attr(),
    });
    App.TaskList.url = "https://www.googleapis.com/tasks/v1/users/@me/lists";
    App.TaskList.adapter = App.CustomAdapter.create();
    App.TaskList.collectionKey = "items";
    App.TaskList.primaryKey = "id";

    App.TasksModels = {};
    function makeTasksModel(id) {
        var model = Ember.Model.extend({
            id: Ember.attr(),
            title: Ember.attr(),
            selfLink: Ember.attr(),
            notes: Ember.attr(),
            status: Ember.attr(),
            due: Ember.attr(),
            completed: Ember.attr(),
            deleted: Ember.attr(),
            updated: Ember.attr(),
            position: Ember.attr(),
            hidden: Ember.attr(),
        });
        model.url = "https://www.googleapis.com/tasks/v1/lists/" + id + "/tasks";
        model.adapter = App.CustomAdapter.create();
        model.collectionKey = "items";
        model.primaryKey = "id";
        App.TasksModels[id] = model;
        return model;
    }

    var currentTaskListId = null;

    App.ListRoute = Ember.Route.extend({
        model: function(params) {
            currentTaskListId = params.tasklist_id;
            makeTasksModel(params.tasklist_id);
            return App.TasksModels[params.tasklist_id].findAll();
        }
    });


    function sortByPosition (a, b) {
        var pa = a.get("position");
        var pb = b.get("position");
        return pa - pb;
    }

    App.ListController = Ember.ArrayController.extend({
        actions: {
            createTask: function createTask() {
                var input = $('.js-handler--newtasktitle');
                App.TasksModels[currentTaskListId].create({title: input.val()}).save();
                input.val("");
            }
        },

        all: Ember.computed.sort("[]", sortByPosition),

        incomplete: Ember.computed.filter("[]", function(task) {
            return task.get("status") == "needsAction";
        })
    });
}
