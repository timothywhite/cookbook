from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.template import Context, Template

from recipes_api import models
from rest_framework import serializers
from rest_framework.reverse import reverse

from taggit.managers import TaggableManager
from mixed import Mixed

from ast import literal_eval

class WritableSerializerField(serializers.WritableField):
	"""A field to allow for one to one relationships to be modified."""
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
			'description',
			'order'
		)

class ScaledRecipeIngredientSerializer(RecipeIngredientSerializer):
	amount = serializers.SerializerMethodField('scale_amount')
	description = serializers.SerializerMethodField('rendered_description')

	def scale_amount(self, model):
		if 'request' in self.context:
			if 'scale' in self.context['request'].GET:
				return str(Mixed(model.amount) * int(self.context['request'].GET['scale']))
		return model.amount

	def rendered_description(self, model):
		value = model.description
		try:
			raw = False
			if 'request' in self.context and 'raw' in self.context['request'].GET:
				raw = self.context['request'].GET['raw'] == '1'

			if not raw:
				return Template('{% load recipe_tags %}' + value).render(Context({}))
			else:
				return value
		except:
			return value;

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

class DescriptionField(serializers.WritableField):
	def to_native(self, value):
		try:
			raw = False
			if 'request' in self.context and 'raw' in self.context['request'].GET:
				raw = self.context['request'].GET['raw'] == '1'

			if not raw:
				return Template('{% load recipe_tags %}' + value).render(Context({}))
			else:
				return value
		except:
			return value;
	def from_native(self, value):
		return value

class RecipeSerializer(serializers.ModelSerializer):
	recipe_ingredients = ScaledRecipeIngredientSerializer(many=True, read_only=True)
	author = UserField()
	description = DescriptionField()
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
