from django.conf.urls.defaults import patterns, include, url

from django.views.generic import TemplateView

urlpatterns = patterns('',
	url(r'^login/$','django.contrib.auth.views.login', {'template_name': 'login.html'}),
	url(r'^logout/$','django.contrib.auth.views.logout_then_login'),
	url(r'^$', TemplateView.as_view(template_name="index.html")),
)