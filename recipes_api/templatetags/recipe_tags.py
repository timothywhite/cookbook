from django import template

register = template.Library()


def recipe_link(parser, token):
	arguments = token.split_contents()
	if (len(arguments) != 3):
		raise template.TemplateSyntaxError("invalid argument length")
		
	return RecipeLinkNode(arguments[1], arguments[2])
	
class RecipeLinkNode(template.Node):
	def __init__(self, id, text):
		self.recipe_id = id
		self.link_text = text
		
	def render(self, context):
		return "<a class='recipe_link' href='http://thatswhatshecooked.me#!" + self.recipe_id + ":1;'>" + self.link_text + "</a>"
		
register.tag('recipe_link',recipe_link)