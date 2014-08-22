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
			
			this.ingredientsView.close();
			this.ingredientsView = this.editmode ? new app.RecipeIngredient.EditCompositeView({collection: this.model.get('recipe_ingredients'),recipe_id:this.model.get('id')}) : new app.RecipeIngredient.CollectionView({collection: this.model.get('recipe_ingredients')});
			this.ingredients.show(this.ingredientsView);
			
			this.stepsView.close();
			this.stepsView = this.editmode ? new app.RecipeStep.EditCompositeView({collection: this.model.get('steps'),recipe_id:this.model.get('id')}) : new app.RecipeStep.CollectionView({collection: this.model.get('steps')});
			this.steps.show(this.stepsView);
			
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
			this.ingredientsView = new app.RecipeIngredient.CollectionView({collection: this.model.get('recipe_ingredients')})
			this.ingredients.show(this.ingredientsView);
			this.stepsView = new app.RecipeStep.CollectionView({collection: this.model.get('steps')});
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
			'change .measurement':'checkNewMeasurement',
			'change .ingredient':'checkNewIngredient',
			'click .remove': 'removeIngredient',
			'click .up_ingredient':'upIngredient',
			'click .down_ingredient':'downIngredient',
			'click .revert_measurement': 'revertMeasurement',
			'click .add_new_measurement': 'addNewMeasurement',
			'click .revert_ingredient': 'revertIngredient',
			'click .add_new_ingredient': 'addNewIngredient'
		},
		addNewIngredient: function(){
			var name = this.$('.ingredient').val(),
				model = new app.Ingredient.Model({name:name}),
				ingredient = this.model.get('ingredient')
				view = this;
			app.vent.trigger('save',model, null, {
				success: function(){
					_.extend(ingredient, model.attributes);
					app.vent.trigger('save', view.model);
				}
			});
		},
		revertIngredient: function(){
			this.$('.ingredient').val(this.model.get('ingredient').name);
		},
		addNewMeasurement: function(){
			var name = this.$('.measurement').val(),
				abbr = this.$('.measurement_abbreviation').val(),
				model = new app.Measurement.Model({name:name,abbreviation:abbr}),
				measurement = this.model.get('measurement')
				view = this;
			app.vent.trigger('save',model, null, {
				success: function(){
					_.extend(measurement, model.attributes);
					app.vent.trigger('save', view.model);
				}
			});
		},
		revertMeasurement:function(){
			this.$('.measurement').val(this.model.get('measurement').name);
		},
		checkNewIngredient: function(){
			(function(view){
				setTimeout(function(){
					if (view.$('.ingredient').val() != view.model.get('ingredient').name){
						view.$('.new_ingredient_name').html(view.$('.ingredient').val());
						view.$('#new_ingredient_'+view.model.get('id')).modal('show');
					}
				}, 200);
			})(this);
		},
		checkNewMeasurement: function(){
			(function(view){
				setTimeout(function(){
					if (view.$('.measurement').val() != view.model.get('measurement').name){
						view.$('.new_measurement_name').html(view.$('.measurement').val());
						view.$('#new_measurement_'+view.model.get('id')).modal('show');
					}
				}, 200);
			})(this);
		},
		saveIngredient: function(){
			this.model.set('amount',this.$('.amount').val());
			this.model.set('description',this.$('.description').val());
			app.vent.trigger('save',this.model);
		},
		removeIngredient: function(){
			this.trigger('ingredient:remove');
		},
		upIngredient: function(){
			this.trigger('ingredient:up');
		},
		downIngredient: function(){
			this.trigger('ingredient:down');
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
					},
					menu:'<ul class="measurement_dropdown typeahead dropdown-menu"></ul>'
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
					},
					menu:'<ul class="igredient_dropdown typeahead dropdown-menu"></ul>'
				});
			})(this);
		}
	});
	RecipeIngredient.CollectionView = Backbone.Marionette.CollectionView.extend({
		itemView: RecipeIngredient.View,
		tagName: 'ul',
	});
	RecipeIngredient.EditCompositeView = Backbone.Marionette.CompositeView.extend({
		itemView: RecipeIngredient.EditView,
		itemViewContainer: 'ul',
		template: app.Template.get('editrecipeingredients'),
		events: {
			'click .add-ingredient':'addIngredient',
			'change .new_amount,.new_description':'updateIngredient',
			'change .new_ingredient':'checkNewIngredient',
			'click .revert_ingredient_add': 'revertIngredient',
			'click .add_new_ingredient_add': 'addNewIngredient',
			'change .new_measurement':'checkNewMeasurement',
			'click .revert_measurement_add': 'revertMeasurement',
			'click .add_new_measurement_add': 'addNewMeasurement',
		},
		initialize: function(options){
			this.recipe_id = options.recipe_id;
			this.on('itemview:ingredient:remove',this.removeIngredient);
			this.on('itemview:ingredient:up',this.upIngredient);
			this.on('itemview:ingredient:down',this.downIngredient);
			this.model = new RecipeIngredient.Model({recipe: this.recipe_id});
			this.collection.comparator = function(model) {
				return model.get('order');
			};
		},
		checkNewMeasurement: function(){
			(function(view){
				setTimeout(function(){
					if (!view.model.get('measurement') || (view.$('.new_measurement').val() != view.model.get('measurement').name)){
						view.$('.new_measurement_name_add').html(view.$('.new_measurement').val());
						view.$('#new_measurement_'+view.model.get('recipe')).modal('show');
					}
				}, 200);
			})(this);
		},
		addNewMeasurement: function(){
			var name = this.$('.new_measurement').val(),
				abbr = this.$('.measurement_abbreviation_add').val() || this.$('.new_measurement').val(),
				model = new app.Measurement.Model({name:name,abbreviation:abbr}),
				view = this;
			app.vent.trigger('save',model, null, {
				success: function(){
					view.model.set('measurement',model.attributes);
				}
			});
		},
		revertMeasurement:function(){
			this.$('.new_measurement').val(this.model.get('measurement') ? this.model.get('measurement').name || '' : '');
		},
		checkNewIngredient: function(){
			(function(view){
				setTimeout(function(){
					if (!view.model.get('ingredient') || (view.$('.new_ingredient').val() != view.model.get('ingredient').name)){
						view.$('.new_ingredient_name_add').html(view.$('.new_ingredient').val());
						view.$('#new_ingredient_'+view.model.get('recipe')).modal('show');
					}
				}, 200);
			})(this);
		},
		addNewIngredient: function(){
			var name = this.$('.new_ingredient').val(),
				model = new app.Ingredient.Model({name:name}),
				view = this;
			app.vent.trigger('save',model, null, {
				success: function(){
					view.model.set('ingredient', model.attributes);
				}
			});
		},
		revertIngredient: function(){
			this.$('.new_ingredient').val(this.model.get('ingredient') ? this.model.get('ingredient').name || '' : '');
		},
		onCollectionRendered: function(){
			this.children.invoke('setupTypeaheads');
			this.setupTypeaheads();
			this.delegateEvents();
		},
		setupTypeaheads:function(){
			(function(view){
				view.$('.new_measurement').typeahead({
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
						var measurement = view.model.get('measurement') || {};
						_.extend(measurement, model.attributes);
						view.model.set('measurement', measurement);
						return model.get('name');
					},
					labeler: function(model){
						return model.get('name');
					}
				});
				view.$('.new_ingredient').typeahead({
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
						var ingredient = view.model.get('ingredient') || {};
						_.extend(ingredient, model.attributes);
						view.model.set('ingredient', ingredient);
						return model.get('name');
					}
				});
			})(this);
		},
		updateIngredient: function(){
			var amount = this.$('.new_amount').val(),
				description = this.$('.new_description').val();
			this.model.set('amount',amount);
			this.model.set('description',description);
		},
		addIngredient: function(){
			(function(view){
				view.model.set('order', view.collection.length);
				app.vent.trigger('save',view.model,null,{
					success: function(){
						view.collection.add(view.model);
						view.model = new RecipeIngredient.Model({recipe: view.recipe_id});
						view.render();
						view.$('.new_amount').focus();
					}
				});
			})(this);
		},
		removeIngredient: function(itemview){
			this.collection.remove({id:itemview.model.get('id')});
			app.vent.trigger('destroy',itemview.model);
			this.updateOrder();
			this.render();
		},
		upIngredient: function(itemview){
			src = itemview.model.get('order');
			if (src != 0){
				dst = src - 1;
				dstModel = this.collection.findWhere({order:dst});
				srcModel = this.collection.findWhere({order:src});
				dstModel.set('order',src);
				srcModel.set('order',dst);
				app.vent.trigger('save',dstModel);
				app.vent.trigger('save',srcModel);
				this.collection.sort();
				this.render();
			}
		},
		downIngredient: function(itemview){
			src = itemview.model.get('order');
			if (src != (this.collection.length - 1)){
				dst = src + 1;
				dstModel = this.collection.findWhere({order:dst});
				srcModel = this.collection.findWhere({order:src});
				dstModel.set('order',src);
				srcModel.set('order',dst);
				app.vent.trigger('save',dstModel);
				app.vent.trigger('save',srcModel);
				this.collection.sort();
				this.render();
			}
		},
		updateOrder: function(){
			var order = 0;
			this.collection.each(function(model){
				model.set('order',order);
				app.vent.trigger('save',model);
				order++;
			});
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
		template: app.Template.get('editrecipestep'),
		events:{
			'change .description':'saveStep',
			'click .remove_step': 'removeStep',
			'click .up_step': 'upStep',
			'click .down_step': 'downStep'
		},
		saveStep: function(){
			this.model.set('description', this.$('.description').val());
			app.vent.trigger('save',this.model);
		},
		removeStep: function(){
			this.trigger('step:remove');
		},
		upStep: function(){
			this.trigger('step:up');
		},
		downStep: function(){
			this.trigger('step:down');
		}
	});
	RecipeStep.CollectionView = Backbone.Marionette.CollectionView.extend({
		tagName: 'ol',
		itemView: RecipeStep.View
	});
	RecipeStep.EditCompositeView = Backbone.Marionette.CompositeView.extend({
		itemViewContainer: 'ol',
		itemView: RecipeStep.EditView,
		template: app.Template.get('editrecipesteps'),
		events:{
			'click .add_step':'addStep'
		},
		initialize: function(options){
			this.recipe_id = options.recipe_id;
			this.on('itemview:step:remove', this.removeStep);
			this.on('itemview:step:up', this.upStep);
			this.on('itemview:step:down', this.downStep);
			this.collection.comparator = function(model) {
				return model.get('order');
			};
		},
		onShow:function(){
			this.delegateEvents();
		},
		addStep: function(){
			if(this.$('.new_description').val()){
				var model = new RecipeStep.Model({recipe:this.recipe_id,description:this.$('.new_description').val(), order:this.collection.length}),
					view = this;
				app.vent.trigger('save', model, null, {
					success: function(){
						view.collection.add(model);
						view.render();
						view.$('.new_description').focus();
					}
				});
			}
		},
		upStep: function(itemview){
			src = itemview.model.get('order');
			if (src != 0){
				dst = src - 1;
				dstModel = this.collection.findWhere({order:dst});
				srcModel = this.collection.findWhere({order:src});
				dstModel.set('order',src);
				srcModel.set('order',dst);
				app.vent.trigger('save',dstModel);
				app.vent.trigger('save',srcModel);
				this.collection.sort();
				this.render();
			}
		},
		downStep: function(itemview){
			src = itemview.model.get('order');
			if (src != (this.collection.length - 1)){
				dst = src + 1;
				dstModel = this.collection.findWhere({order:dst});
				srcModel = this.collection.findWhere({order:src});
				dstModel.set('order',src);
				srcModel.set('order',dst);
				app.vent.trigger('save',dstModel);
				app.vent.trigger('save',srcModel);
				this.collection.sort();
				this.render();
			}
		},
		removeStep: function(itemview){
			this.collection.remove({id:itemview.model.get('id')});
			app.vent.trigger('destroy',itemview.model);
			this.updateOrder();
			this.render();
		},
		updateOrder: function(){
			var order = 0;
			this.collection.each(function(model){
				model.set('order',order);
				app.vent.trigger('save',model);
				order++;
			});
		}
	});
});