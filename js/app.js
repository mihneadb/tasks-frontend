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

function main() {
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
        actions: {
            createList: function createList () {
                var input = $('.js-handler--newlistname');
                App.TaskList.create({title: input.val()}).save();
                input.val("");
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
            hidden: Ember.attr(),
        });
        model.url = "https://www.googleapis.com/tasks/v1/lists/" + id + "/tasks";
        model.adapter = App.CustomAdapter.create();
        model.collectionKey = "items";
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

    App.ListController = Ember.ArrayController.extend({
        actions: {
            createTask: function createTask() {
                var input = $('.js-handler--newtasktitle');
                App.TasksModels[currentTaskListId].create({title: input.val()}).save();
                input.val("");
            }
        },
        incomplete: Ember.computed.filter("[]", function(task) {
            return task.get("status") == "needsAction";
        })
    });
}
