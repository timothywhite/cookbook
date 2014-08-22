from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

from taggit.managers import TaggableManager

from mixed import Mixed

import inflect
#This module is used to pluralize ingredient and measurement names based on the related amounts.
p = inflect.engine()


def validate_mixed_number(value):
	try:
		Mixed(value)
	except TypeError:
		raise ValidationError("Could not interpret as mixed number.")

class Ingredient(models.Model):
	name = models.CharField(max_length=255)
	
	def __unicode__(self):
		return self.name
	
class Measurement(models.Model):
	name = models.CharField(max_length=255)
	abbreviation = models.CharField(max_length=255, blank=True)
	
	def __unicode__(self):
		return self.name
	
class MeasurementConversion(models.Model):
	source = models.ForeignKey(Measurement, related_name='source', null=True, blank=True)
	destination = models.ForeignKey(Measurement, related_name='destination', null=True, blank=True)
	factor = models.FloatField()
	threshold = models.FloatField()
	
	ingredient = models.ForeignKey(Ingredient, related_name='ingredient', null=True, blank=True)
	
	def __unicode__(self):
		name = ""
		if self.source and self.destination:
			name = str(self.source) + " to " + str(self.destination)
		elif self.destination:
			name = "Terminal for " + str(self.destination)
		elif self.source:
			name = "Terminal for " + str(self.source)
		else:
			name = "Empty conversion"
		
		if self.ingredient:
			name += " of " + str(self.ingredient)
		
		return name

class Recipe(models.Model):
	author = models.ForeignKey(User)
	name = models.CharField(max_length=255)
	servings = models.IntegerField()
	active_time = models.IntegerField()
	inactive_time = models.IntegerField()
	description = models.TextField()
	ingredients = models.ManyToManyField(Ingredient, through='RecipeIngredient')
	image = models.ImageField(upload_to=(lambda recipe,filename: 'images/recipes/%d/%s' % (recipe.id,filename)), blank=True)
	tags = TaggableManager()
	
	def _get_tags(self):
		"""Return tags as a comma delimited list of tags."""
		return ', '.join([str(tag) for tag in self.tags.all()]);
	
	def _set_tags(self,tags):
		"""Set tags from a comma delimited list of tags."""
		tag_list = []
		if ',' in tags:
			tag_list = [s.strip() for s in tags.split(',')]
		else:
			tag_list = [s.strip() for s in tags.split(' ') if s != '']
		self.tags.clear()
		for tag in tag_list:
			self.tags.add(tag)
	
	tag_set = property(_get_tags, _set_tags)
	
	def scale(self,factor):
		"""Scale the recipe ingredients by <factor> in place. Does not commit changes to the database."""
		assert factor > 0
		if factor == 1:
			return self
		else:
			recipe = Recipe.objects.get(pk=self.id)
			recipe.id = None
			ingredients = []
			for ingredient in recipe.recipe_ingredients.all():
				ingredient.amount = Mixed(ingredient.amount) * factor
				ingredients.append(ingredient)
			
			recipe.recipe_ingredients = ingredients
			return recipe
	
	def __unicode__(self):
		return self.name
	class Meta:
		ordering = ('name',)

class RecipeIngredient(models.Model):
	recipe = models.ForeignKey(Recipe, related_name='recipe_ingredients')
	ingredient = models.ForeignKey(Ingredient, null=True, blank=True)
	measurement = models.ForeignKey(Measurement)
	amount = models.CharField(max_length=255, validators=[validate_mixed_number])
	description = models.CharField(max_length=255,blank=True)
	order = models.IntegerField(default=0)
	
	def _get_inflected_name(self):
		"""Return the ingredient name appropriately pluralized based on the amount."""
		return p.plural(self.ingredient.name,float(Mixed(self.amount)))
	
	inflected_name = property(_get_inflected_name)
	
	def _get_inflected_measurement(self):
		"""Return the measurement name appropriately pluralized based on the amount."""
		return p.plural(self.measurement.name, float(Mixed(self.amount)))
	
	inflected_measurement = property(_get_inflected_measurement)
	
	def __unicode__(self):
		s = str(self.amount) + ' ' + str(self.measurement) + ' '
		if (self.ingredient):
			s += str(self.ingredient)
			if (self.description):
				s += ' (' + str(self.description) + ')'
		else:
			if (self.description):
				s += ' ' + str(self.description)
		
		return s
	
	class Meta:
		ordering = ('order',)
	
class Step(models.Model):
	recipe = models.ForeignKey(Recipe, related_name='steps')
	description = models.TextField()
	order = models.IntegerField(default=0)
	image = models.ImageField(upload_to=(lambda s,f: 'images/recipes/%d/steps/%s' % (s.recipe.id,f)), blank=True)
	
	def __unicode__(self):
		return 'Step'
	
	class Meta:
		ordering = ('order',)
		
	
