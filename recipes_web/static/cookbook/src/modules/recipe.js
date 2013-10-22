app.module("Recipe", function(Recipe,app,Backbone,Marionette,$,_){
	Recipe.Model = Backbone.Model.extend({
		urlRoot:'/api/recipe/',
		initialize: function(){
			this.on('change:recipe_ingredients', function(model, recipe_ingredients) {
				if(!(model.get('recipe_ingredients') instanceof app.RecipeIngredient.Collection)){
					model.set('recipe_ingredients', new app.RecipeIngredient.Collection(recipe_ingredients));
				}
			});
			this.set('recipe_ingredients', new app.RecipeIngredient.Collection(this.get('recipe_ingredients')));
			
			
			this.on('change:steps', function(model, steps) {
				if(!(model.get('steps') instanceof app.RecipeStep.Collection)){
					model.set('steps', new app.RecipeStep.Collection(steps));
				}
			});
			this.set('steps', new app.RecipeStep.Collection(this.get('steps')));
		}
	});
	Recipe.Collection = Backbone.Collection.extend({
		url: '/api/recipe/',
		model: Recipe.Model
	});
	Recipe.Layout = Backbone.Marionette.Layout.extend({
		tagName: 'div',
		regions: {
			'ingredients': '.recipe_ingredients',
			'steps': '.recipe_steps'
		},
		initialize: function(){
			this.setTemplate();
		},
		onRender:function(){
			this.$('.measurement_abbreviation').tooltip();
		},
		renderAll:function(){
			this.render();
			this.steps.show(this.stepsView);
			this.ingredients.show(this.ingredientsView);
		},
		events: {
			'click .edit_recipe': 'toggleEditMode',
			'change .recipe_name,.recipe_description,.recipe_servings,.recipe_active_time,.recipe_inactive_time': 'saveRecipe',
		},
		setTemplate: function(){
			if(this.editmode){
				this.template = app.Template.get('editrecipe')
			}else{
				this.template = app.Template.get('recipe')
			}
		},
		toggleEditMode: function(){
			this.editmode = !this.editmode;
			this.stepsView.setEditMode(this.editmode);
			this.ingredientsView.setEditMode(this.editmode);
			this.setTemplate();
			this.renderAll();
		},
		saveRecipe: function(){
			this.model.set('name', this.$('.recipe_name').val() == '' ? this.model.get('name') : this.$('.recipe_name').val());
			this.model.set('description', this.$('.recipe_description').val() == '' ? this.model.get('description') : this.$('.recipe_description').val());
			this.model.set('servings', this.$('.recipe_servings').val() == '' ? '1' : this.$('.recipe_servings').val());
			this.model.set('active_time', this.$('.recipe_active_time').val() == '' ? '0' : this.$('.recipe_active_time').val());
			this.model.set('inactive_time', this.$('.recipe_inactive_time').val() == '' ? '0' : this.$('.recipe_inactive_time').val());
			this.renderAll();
			app.vent.trigger('save', this.model);
		},
		onTabAdd: function(){
			this.ingredientsView = new app.RecipeIngredient.CollectionView({
				collection: this.model.get('recipe_ingredients')
			});
			this.ingredients.show(this.ingredientsView);
			this.stepsView = new app.RecipeStep.CollectionView({
				collection: this.model.get('steps')
			});
			this.steps.show(this.stepsView);
		},
		onAfterRender: function(){
			alert('after');
		}
	});
});
app.module("Ingredient", function(Ingredient,app,Backbone,Marionette,$,_){
	Ingredient.Model = Backbone.Model.extend({
		urlRoot: '/api/ingredient/'
	});
	Ingredient.Collection = Backbone.Collection.extend({
		url: '/api/ingredient/',
		model: Ingredient.Model
	});
});
app.module("Measurement", function(Measurement,app,Backbone,Marionette,$,_){
	Measurement.Model = Backbone.Model.extend({
		urlRoot: '/api/measurement/'
	});
	Measurement.Collection = Backbone.Collection.extend({
		url: '/api/measurement/',
		model: Measurement.Model
	});
});
app.module("RecipeIngredient", function(RecipeIngredient,app,Backbone,Marionette,$,_){
	RecipeIngredient.Model = Backbone.Model.extend({
		urlRoot: '/api/recipe/ingredient/'
	});
	RecipeIngredient.Collection = Backbone.Collection.extend({
		url: '/api/recipe/ingredient/',
		model: RecipeIngredient.Model
	});
	RecipeIngredient.View = Backbone.Marionette.ItemView.extend({
		tagName: 'li',
		template: app.Template.get('recipeingredient'),
	});
	RecipeIngredient.EditView = Backbone.Marionette.ItemView.extend({
		tagName: 'li',
		template: app.Template.get('editrecipeingredient'),
		events: {
			'change .amount,.description': 'saveIngredient',
			'click .remove': 'removeIngredient'
		},
		saveIngredient: function(){
			this.model.set('amount',this.$('.amount').val());
			this.model.set('description',this.$('.description').val());
			app.vent.trigger('save',this.model);
		},
		removeIngredient: function(){
			
			this.trigger('ingredient:remove');
		},
		setupTypeaheads:function(){
			(function(view){
				view.$('.measurement').typeahead({
					source:function (query, process){
						collection = new app.Measurement.Collection();
						collection.fetch({
							data:{
								name: query
							},
							success:function(collection, response, options){
								process(collection.models);
							},
							error:function(collection, response, options){
								app.vent.trigger('fetch:error',response.status);
							}
						});
					},
					updater: function(model){
						var measurement = view.model.get('measurement');
						_.extend(measurement, model.attributes);
						app.vent.trigger('save', view.model);
						return model.get('name');
					},
					labeler: function(model){
						return model.get('name');
					}
				});
				view.$('.ingredient').typeahead({
					source:function (query, process){
						collection = new app.Ingredient.Collection();
						collection.fetch({
							data:{
								name: query
							},
							success:function(collection, response, options){
								process(collection.models);
							},
							error:function(collection, response, options){
								app.vent.trigger('fetch:error',response.status);
							}
						});
					},
					labeler: function(model){
						return model.get('name');
					},
					updater: function(model){
						var ingredient = view.model.get('ingredient');
						_.extend(ingredient, model.attributes);
						app.vent.trigger('save', view.model);
						return model.get('name');
					}
				});
			})(this);
		}
	});
	RecipeIngredient.CollectionView = Backbone.Marionette.CollectionView.extend({
		tagName: 'ul',
		itemView: RecipeIngredient.View,
		initialize: function(){
			this.on('itemview:ingredient:remove',this.removeIngredient);
		},
		removeIngredient: function(itemview){
			this.collection.remove({id:itemview.model.get('id')});
			//app.vent.trigger('destroy',itemview.model);
			this.render();
		},
		setEditMode: function(editmode){
			self.editmode = editmode;
			this.itemView = self.editmode ? RecipeIngredient.EditView : RecipeIngredient.View;
			this.render();
		},
		onCollectionRendered: function(){
			if (self.editmode) this.children.invoke('setupTypeaheads');
		}
	});
});
app.module("RecipeStep", function(RecipeStep,app,Backbone,Marionette,$,_){
	RecipeStep.Model = Backbone.Model.extend({
		urlRoot: '/api/step/'
	});
	RecipeStep.Collection = Backbone.Collection.extend({
		url: '/api/step/',
		model: RecipeStep.Model
	});
	RecipeStep.View = Backbone.Marionette.ItemView.extend({
		tagName: 'li',
		template: app.Template.get('recipestep')
	});
	RecipeStep.EditView = Backbone.Marionette.ItemView.extend({
		tagName: 'li',
		template: app.Template.get('editrecipestep')
	});
	RecipeStep.CollectionView = Backbone.Marionette.CollectionView.extend({
		tagName: 'ol',
		itemView: RecipeStep.View,
		setEditMode: function(editmode){
			this.itemView = editmode ? RecipeStep.EditView : RecipeStep.View;
			this.render();
		}
	});
});
