app = new Backbone.Marionette.Application();
app.controller = {
	loadRecipes: function(ids){
		if (typeof ids === "string") ids = ids.split('/').reverse();
		id = ids.pop();
		if(id){
			app.vent.trigger('fetch', new app.Recipe.Model({id: id}), {
				success: function(model, response, options){
					app.vent.trigger('tab:show', model);
					options.controller.loadRecipes(ids);
				},
				controller: this
			});
		}
	}
}
app.Router = Backbone.Marionette.AppRouter.extend({
	appRoutes:{
		'!r/*ids' : 'loadRecipes'
	},
	controller: app.controller
});
app.addRegions({
	sidebar: '#sidebar'
});
//Initialize objects...
app.addInitializer(function(){
	var sidebar = new app.Sidebar.View();
	app.sidebar.show(sidebar);
	app.router = new app.Router();
	app.recipeTabManager = new app.Tab.TabManager({
		type: 'song',
		panesEl: '#recipe_tab_content',
		tabsEl:'#recipe_tab_nav',
		paneView: app.Recipe.Layout,
		closeable: true
	});
	app.recipeTabManager.tabView.on('tab:close', function(){
		app.router.navigate('!r/' + app.recipeTabManager.getPanes().models.map(function(m){return m.id;}).join('/'));
	});
});
//Add events...
app.addInitializer(function(){
	app.vent.on({
		'tab:show':function(model){
			app.recipeTabManager.addTab({
				title: model.get('name'),
				model: model
			}).showTab({
				id:model.get('id')
			});
			$('#app-song-tab').tab('show');
			app.router.navigate('!r/' + app.recipeTabManager.getPanes().models.map(function(m){return m.id;}).join('/'));
		},
		'fetch':function(model, options){
			options = options ? options : {}
			options.error = function(model, response, options){
					app.vent.trigger('fetch:error',model, response, options);
			};
			model.fetch(options);
		},
		'save':function(model, attributes, options){
			options = options ? options : {}
			options.error = function(model, response, options){
					app.vent.trigger('save:error',model, response, options);
			};
			model.save(attributes, options)
		},
		'destroy':function(model, options){
			options = options ? options : {}
			options.error = function(model, response, options){
					app.vent.trigger('destroy:error',model, response, options);
			};
			model.destroy(options);
		},
		'fetch:error':function(model, response, options){
			if(response.status == 403){
				alert('you need to login');
			}else{
				alert('fetch error: ' + response.status);
			}
		},
		'save:error':function(model, response, options){
			if(response.status == 403){
				alert('you need to login');
			}else{
				alert('save error: ' + response.status);
			}
		},
		'destroy:error':function(model, response, options){
			if(response.status == 403){
				alert('you need to login');
			}else{
				alert('destroy error: ' + response.status);
			}
		}
	});
});
$(function(){
	app.start();
	Backbone.history.start();
});