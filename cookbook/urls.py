from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
	#url(r'^', include('recipes_web.urls')),
	url(r'^api/', include('recipes_api.urls'))
)