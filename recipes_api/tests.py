from django.test import TestCase
from recipes_api.models import Recipe

from recipes_api.serializers import RecipeSerializer


class RecipeScalingTests(TestCase):
	"""Test recipe scaling."""
	def setUp(self):
		self.recipe = Recipe.objects.get(pk=2)
		
	def test_recipe_setup(self):
		self.assertEqual(self.recipe.name,'Pancakes')
		
	def test_scale_recipe_factor_1(self):
		scaled = self.recipe.scale(1)
		self.assertEqual(scaled,self.recipe)
		
	def test_scale_recipe_factor_2(self):
		scaled = self.recipe.scale(2)
		self.assertEqual(scaled.recipe_ingredients.get(pk=3).amount, '3 1/2')
