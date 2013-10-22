from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template import Context, Template
from django.db.models import Q
from django.contrib.auth.models import User

from recipes_api import models
from recipes_api import serializers

from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse
from rest_framework.response import Response


@api_view(['GET'])
def api_root(request, format=None):
		return Response({
			'Recipe': reverse('recipe-list', request=request),
			'User': reverse('user-list', request=request),
			'Recipe Ingredient': reverse('recipeingredient-list', request=request),
			'Ingredient': reverse('ingredient-list', request=request),
			'Measurement': reverse('measurement-list', request=request),
			'Step': reverse('step-list', request=request),
		})

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
	model = models.User
	serializer_class = serializers.UserSerializer

class UserList(generics.ListCreateAPIView):
	model = models.User
	serializer_class = serializers.UserSerializer

class RecipeDetail(generics.RetrieveUpdateDestroyAPIView):
	model = models.Recipe
	serializer_class = serializers.RecipeSerializer

class RecipeList(generics.ListCreateAPIView):
	model = models.Recipe
	serializer_class = serializers.RecipeListSerializer
	
	def get_queryset(self):
		recipes = models.Recipe.objects.all()
		if 'authors' in self.request.GET:
			ids = self.request.GET['authors'].split(',')
			for id in ids:
				recipes = recipes.filter(author__pk=id)
		if 'name' in self.request.GET:
			name = self.request.GET['name']
			recipes = recipes.filter(name__icontains=name)
		if 'ingredients' in self.request.GET:
			ids = self.request.GET['ingredients'].split(',')
			for id in ids:
				recipes = recipes.filter(ingredients__pk=id)
		if 'tags' in self.request.GET:
			tags = self.request.GET['tags'].split(',')
			for tag in tags:
				recipes = recipes.filter(tags__name__exact=tag).distinct()
		return recipes


class IngredientDetail(generics.RetrieveUpdateDestroyAPIView):
	model = models.Ingredient
	serializer_class = serializers.IngredientSerializer


class IngredientList(generics.ListCreateAPIView):
	model = models.Ingredient
	serializer_class = serializers.IngredientSerializer


class RecipeIngredientDetail(generics.RetrieveUpdateDestroyAPIView):
	model = models.RecipeIngredient
	serializer_class = serializers.RecipeIngredientSerializer


class RecipeIngredientList(generics.ListCreateAPIView):
	model = models.RecipeIngredient
	serializer_class = serializers.RecipeIngredientSerializer


class MeasurementDetail(generics.RetrieveUpdateDestroyAPIView):
	model = models.Measurement
	serializer_class = serializers.MeasurementSerializer


class MeasurementList(generics.ListCreateAPIView):
	model = models.Measurement
	serializer_class = serializers.MeasurementSerializer
	
	def get_queryset(self):
		measurements = models.Measurement.objects.all()
		if 'name' in self.request.GET:
			name = self.request.GET['name']
			measurements = measurements.filter(name__icontains=name)
		return measurements


class StepDetail(generics.RetrieveUpdateDestroyAPIView):
	model = models.Step
	serializer_class = serializers.StepSerializer


class StepList(generics.ListCreateAPIView):
	model = models.Step
	serializer_class = serializers.StepSerializer



