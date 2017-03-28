from django import template # this is necessary to write custom filter to access request.session.xxx dictionary key using the variable "key" in template FOR loop

register = template.Library() # variable to hold registrations

@register.filter
def look_for_questionNumber(sessionDict, questionNumber):
    return sessionDict.get(questionNumber) # will return True of False based of in the questionNumber key is present in request.session

@register.filter
def get_response(sessionDict, questionNumber):
    return sessionDict[questionNumber]["response"] # returns the response to the specified questionNumber

@register.filter
def get_resultsWindow(sessionDict, questionNumber):
    return sessionDict[questionNumber]["resultsWindow"] # returns the resultsWindow to the specified questionNumber
