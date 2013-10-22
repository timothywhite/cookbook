app.module("Extensions", function(Extensions,app,Backbone,Marionette,$,_){
	//modify Backbone.sync to include a csrf token from a cookie if present.
	app.addInitializer(function(){
		csrftokenCookieName = 'csrftoken'
		var oldSync = Backbone.sync;
		Backbone.sync = function(method, model, options){
			if (document.cookie && document.cookie !== '') {
			  var cookies = document.cookie.split(';');
			  for (var i in cookies) {
				cookies[i] = $.trim(cookies[i]);
				if (cookies[i].substring(0, csrftokenCookieName.length + 1) === (csrftokenCookieName + '=')) {
				  var csrftoken = decodeURIComponent(cookies[i].substring(csrftokenCookieName.length + 1));
				  var original = options.beforeSend;
				  options.beforeSend = function(xhr) {
					xhr.setRequestHeader('X-CSRFToken', csrftoken);
					if (original) original();
					return true;
				  };
				  break;
				}
			  }
			}
			return oldSync(method, model, options);
		};
	});
	
});