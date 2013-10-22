app.module("Sidebar", function(Sidebar,app,Backbone,Marionette,$,_){
	Sidebar.SearchResultView = Backbone.Marionette.ItemView.extend({
		template: app.Template.get('searchresult'),
		tagName: 'li',
		events:{
			'click a':'showRecipe'
		},
		showRecipe: function(e){
			e.preventDefault();
			app.vent.trigger('fetch', this.model, {
				success: function(model){
					app.vent.trigger('tab:show', model);
				}
			});
		}
	});
	Sidebar.SearchResultCollectionView = Backbone.Marionette.CollectionView.extend({
		itemView: Sidebar.SearchResultView
	});
	Sidebar.View = Backbone.Marionette.ItemView.extend({
		tagName: 'div',
		className: 'well sidebar-nav',
		template: app.Template.get('sidebar'),
		events:{
			'keyup #search_name_input':'searchByName'
		},
		searchByName: function(){
			app.vent.trigger('fetch', Sidebar.byNameResultsView.collection, {
				reset: true,
				data: {
					name: $('#search_name_input').val()
				},
				error:function(model, response, options){
					app.vent.trigger('fetch:error',response.status);
				}
			});
		}
	});
	Sidebar.addInitializer(function(){
		Sidebar.byNameResultsView = new Sidebar.SearchResultCollectionView({ 
			el: '#search_results_name',
			collection: new app.Recipe.Collection()
		});
		Sidebar.byNameResultsView.render();
	});
});