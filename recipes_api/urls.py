from django.conf.urls.defaults import patterns, include, url

from recipes_api.views import *

urlpatterns = patterns('',
	url(r'^$', 'recipes_api.views.api_root'),
	
	url(r'^user/(?P<pk>\d+)$', UserDetail.as_view(), name='user-detail'),
	url(r'^user/$', UserList.as_view(), name='user-list'),
	
	url(r'^recipe/(?P<pk>\d+)$', RecipeDetail.as_view(), name='recipe-detail'),
	url(r'^recipe/$', RecipeList.as_view(), name='recipe-list'),
	
	url(r'^ingredient/(?P<pk>\d+)$', IngredientDetail.as_view(), name='ingredient-detail'),
	url(r'^ingredient/$', IngredientList.as_view(), name='ingredient-list'),
	
	url(r'^recipe/ingredient/(?P<pk>\d+)$', RecipeIngredientDetail.as_view(), name='recipeingredient-detail'),
	url(r'^recipe/ingredient/$', RecipeIngredientList.as_view(), name='recipeingredient-list'),
	
	url(r'^measurement/(?P<pk>\d+)$', MeasurementDetail.as_view(), name='measurement-detail'),
	url(r'^measurement/$', MeasurementList.as_view(), name='measurement-list'),
	
	url(r'^step/(?P<pk>\d+)$', StepDetail.as_view(), name='step-detail'),
	url(r'^step/$', StepList.as_view(), name='step-list')
)