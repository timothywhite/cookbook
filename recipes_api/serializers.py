from django.contrib.auth.models import User

from recipes_api import models
from rest_framework import serializers
from rest_framework.reverse import reverse

from taggit.managers import TaggableManager
from mixed import Mixed

from ast import literal_eval

class WritableSerializerField(serializers.WritableField):
	def to_native(self,value):
		return self.serializer_class(value).data
	def from_native(self,value):
		return self.model.objects.get(pk=value['id'])

class IngredientSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Ingredient
		fields = (
			'id',
			'name'
		)
	
class MeasurementSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Measurement
		fields = (
			'id',
			'name',
			'abbreviation'
		)
	
class StepSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Step
		fields = (
			'id',
			'recipe',
			'description',
			'order'
		)
		
class IngredientField(WritableSerializerField):
	serializer_class = IngredientSerializer
	model = models.Ingredient
		
class MeasurementField(WritableSerializerField):
	serializer_class = MeasurementSerializer
	model = models.Measurement
	
class RecipeIngredientSerializer(serializers.ModelSerializer):
	ingredient = IngredientField()
	measurement = MeasurementField()
	class Meta:
		model = models.RecipeIngredient
		fields = (
			'id',
			'recipe',
			'ingredient',
			'measurement',
			'amount',
			'description'
		)
		
class ScaledRecipeIngredientSerializer(RecipeIngredientSerializer):
	amount = serializers.SerializerMethodField('scale_amount')
	
	def scale_amount(self, model):
		if 'request' in self.context:
			if 'scale' in self.context['request'].GET:
				return str(Mixed(model.amount) * int(self.context['request'].GET['scale']))
		return model.amount
		
		
		
class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = (
			'id',
			'username',
			'first_name',
			'last_name',
			'email'
		)
		
		
class UserField(WritableSerializerField):
	serializer_class = UserSerializer
	model = User
		
class ServingsField(serializers.WritableField):
	def to_native(self,value):
		if 'request' in self.context:
			if 'scale' in self.context['request'].GET:
				return value * int(self.context['request'].GET['scale'])
		return value
		
	def from_native(self, value):
		return value
		
class RecipeListSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.Recipe
		fields = ('id','name')
		
class RecipeSerializer(serializers.ModelSerializer):
	recipe_ingredients = ScaledRecipeIngredientSerializer(many=True, read_only=True)
	author = UserField()
	steps = StepSerializer(many=True, read_only=True)
	tags = serializers.CharField(source='tag_set',blank=True)
	scale = serializers.SerializerMethodField('get_scale')
	servings = ServingsField()
		
	def get_scale(self,model):
		if 'request' in self.context:
			if 'scale' in self.context['request'].GET:
				return int(self.context['request'].GET['scale'])
		return 1
		
	class Meta:
		model = models.Recipe
		fields = (
			'id',
			'author',
			'name',
			'servings',
			'active_time',
			'inactive_time',
			'description',
			'scale',
			'tags',
			'recipe_ingredients',
			'steps'
		)