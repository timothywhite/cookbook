
app.module("Template", function(Template,app,Backbone,Marionette,$,_){
	Template.urlRoot = '/static/cookbook/src/templates/'
	
	Template.get = function(name){
		//checks for a precompiled template. If it exists, it returns it, otherwise it fetches the template from the server and compiles it.
		if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
			$.ajax({
				url : Template.urlRoot + name + '.handlebars',
				success : function(data) {
					if (Handlebars.templates === undefined) {
						Handlebars.templates = {};
					}
					Handlebars.templates[name] = Handlebars.compile(data);
				},
				async : false
			});
		}
		return Handlebars.templates[name];
	};

});

//append precompiled templates here for production