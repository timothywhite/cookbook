//A module to manage the sidebar search and new recipe form.
app.module("Sidebar", function(Sidebar,app,Backbone,Marionette,$,_){
	Sidebar.SearchResultView = Backbone.Marionette.ItemView.extend({
		template: app.Template.get('searchresult'),
		tagName: 'li',
		events:{
			'click a':'showRecipe'
		},
		showRecipe: function(e){
			//trigger when a user clicks a recipe in the search results and triggers the app event to display a recipe.
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
			'keyup #search_name_input':'searchByName',
			'click .launch_recipe_modal':'launchNewRecipeModal',
			'click .add_new_recipe':'addRecipe'
		},
		launchNewRecipeModal: function(){
			this.$('#new_recipe_modal').modal('show');
		},
		resetNewRecipeModal: function(){
			//reset all values after successful recipe creation
			this.$('#new_recipe_modal').modal('hide');
			
			this.$('.recipe_name').val('');
			this.$('.recipe_servings').val('');
			this.$('.recipe_active_time').val('');
			this.$('.recipe_inactive_time').val('');
			this.$('.recipe_description').val('');
			this.$('.error').html('').hide();
		},
		addRecipe: function(){
			if(this.$('.recipe_name').val()
				&& this.$('.recipe_servings').val()
				&& this.$('.recipe_active_time').val()
				&& this.$('.recipe_inactive_time').val()
				&& this.$('.recipe_description').val()){
				
				var model = new app.Recipe.Model({
					name:this.$('.recipe_name').val(),
					author:{
						id:app.getUserId()
					},
					servings:this.$('.recipe_servings').val(),
					active_time:this.$('.recipe_active_time').val(),
					inactive_time:this.$('.recipe_inactive_time').val(),
					description:this.$('.recipe_description').val()
				});
				app.vent.trigger('save',model,null,{
					success: function(model){
						app.vent.trigger('tab:show', model);
						view = app.recipeTabManager.getPaneView(model);
						view.toggleEditMode();
					}
				});
				
				this.resetNewRecipeModal();
				
			}else{
				this.$('.error').html('You must fill out all fields.').show();
			}
		},
		searchByName: function(){
			//populate the search results collection with the search results.
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
		//initialize and render the sidebar
		Sidebar.byNameResultsView = new Sidebar.SearchResultCollectionView({ 
			el: '#search_results_name',
			collection: new app.Recipe.Collection()
		});
		Sidebar.byNameResultsView.render();
	});
});