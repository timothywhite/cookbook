
app.module("Template", function(Template,app,Backbone,Marionette,$,_){
	Template.urlRoot = '/static/cookbook/src/templates/'
	
	Template.get = function(name){
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