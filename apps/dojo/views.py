from django.shortcuts import render, redirect, HttpResponse # need HttpResponse to respond to URL GET request done by script tag at bottom of index.html. Works without a response but will keep getting console errors
from .models import League, Team, Player
from .tables import LeagueTable, TeamTable, PlayerTable
from django_tables2 import RequestConfig
from django.template.loader import render_to_string
import json, cgi # cgi because some errors produce characters list < or > that need to be escaped before sending back so they render properly as text
from django.db.models import Q, Count # "OR" queries can be made with pipe | or by using django's Q class so I import this to catch both ways of doing it (see question yellow 16)

def index(request):
    return render(request, 'dojo/index.html')

def belt(request, color):
    if color not in ("yellow", "red", "black"):
        return redirect("/")
    lTable = LeagueTable(League.objects.all(), prefix="lTable") # have to give each table its own unique prefix, otherwise the sort links on the columns would sort every table simultaneously
    tTable = TeamTable(Team.objects.all(), prefix="tTable")
    pTable = PlayerTable(Player.objects.all(), prefix="pTable")
    lTable.exclude = (["created_at", "updated_at"]) # only the League model has datetime fields and they're all exactly the same and not used for any question so I won't show it because I need the room for a ManyToManyField table
    RequestConfig(request, paginate=False).configure(lTable)
    RequestConfig(request, paginate=False).configure(tTable)
    RequestConfig(request, paginate=False).configure(pTable)
    context = {"leagueDB": lTable, "teamDB": tTable, "playerDB": pTable, "questions": questionBank[color]}
    return render(request, 'dojo/' + color + '.html', context)

def check(request):
    if not request.GET["response"].startswith(("League.objects.", "Team.objects.", "Player.objects.")): # only answers that start with "model_name.objects." are accepted to limit what goes into the eval() statement below to make it safer
        removePreviousCorrect(request)
        return HttpResponse(json.dumps({"div": request.GET["questionNumber"], "resultsWindow": "<h2 class='redText'>Error</h2><p class='leftJ'>queries must begin with <span class='redText'>model_name.objects.</span></p>"}), content_type = "application/json")
    try: # tries to evaluate entered query and assigns result to variable "responseEval" if successful
        responseEval = eval(request.GET["response"], {'__builtins__':{}}, {"League": League, "Team": Team, "Player": Player, "Q": Q, "Count": Count}) # this disables all __builtins__ and adds back only the valid model names. I don't quite understand this yet but the idea is to make using eval() a bit safer
        print responseEval # for some reason, I have to put this print statement here or else queries containing order_by for non-existing fields will error out in the console. Other query errors are caught just fine. Also, I can't just print anything, it has to be responseEval. Seems like a bug?
    except Exception as error: # if entered query does not evaluate it's because an exception was thrown up. most likely syntax so I return the below message
        removePreviousCorrect(request)
        if str(error) == "The connection hammertime doesn't exist": # this is the error returned from the database router because I put invalid return of "hammertime" (to make sure the error does not exist in django!) for attempted write operations. Now I can intercept it and make it a better error message to return below and DB is safe from writes! Convert error to string to evaluate the equality
            error = "database is read-only"
        return HttpResponse(json.dumps({"div": request.GET["questionNumber"], "resultsWindow": "<h2 class='redText'>Error</h2><p class='leftJ'>" + cgi.escape(str(error)) + "</p>"}), content_type = "application/json")
    if type(responseEval).__name__ not in ("QuerySet", "League", "Team", "Player"): # if entered query produces a QuerySet, change to list so it can be compared to the answer
        if responseEval == answerBank[request.GET["beltcolor"]][request.GET["questionNumber"]]["answerQuery"]:
            resultsWindow = "<h2 class='greenText'>Correct!</h2><p>" + cgi.escape(str(responseEval)) + "</p>"
            request.session[request.GET["questionNumber"]] = {"response": request.GET["response"], "resultsWindow": resultsWindow}
            return HttpResponse(json.dumps({"div": request.GET["questionNumber"], "resultsWindow": resultsWindow, "smiley": True}), content_type = "application/json") # add keyword smiley to let Jquery know to drop a smiley face. value can be anything, I chose True
        else:
            removePreviousCorrect(request)
            return HttpResponse(json.dumps({"div": request.GET["questionNumber"], "resultsWindow": "<h2 class='redText'>Wrong Answer</h2><p>" + cgi.escape(str(responseEval)) + "</p>"}), content_type = "application/json")
    if type(responseEval).__name__ in ("League", "Team", "Player"): # if responseEval is a model objects convert it to equivalent queryset of one object because the comparison login only works with querysets, not models
        responseEval = eval(type(responseEval).__name__ + ".objects.filter(id = '" + str(responseEval.id) + "')")
    if "orderMatters" in answerBank[request.GET["beltcolor"]][request.GET["questionNumber"]]: # if order matters in the answer, just compare the responseEval list to the answer
        test = (list(responseEval) == list(answerBank[request.GET["beltcolor"]][request.GET["questionNumber"]]["answerQuery"])) # need to make querysets into lists to compare them
    else:
        test = (set(responseEval) == set(answerBank[request.GET["beltcolor"]][request.GET["questionNumber"]]["answerQuery"])) # unlike list where order matters in the comparison, set just compares that they both contain the same exact items regardless of the order. Items in a set must all be unique (no dupes) which should work fine since all DB records are unique
    if test:
        resultsWindow = createTable(request, responseEval, "correct")
        request.session[request.GET["questionNumber"]] = {"response": request.GET["response"], "resultsWindow": resultsWindow}
        return HttpResponse(json.dumps({"div": request.GET["questionNumber"], "resultsWindow": resultsWindow, "smiley": True}), content_type = "application/json")
    else:
        removePreviousCorrect(request)
        return HttpResponse(json.dumps({"div": request.GET["questionNumber"], "resultsWindow": createTable(request, responseEval, "wrong")}), content_type = "application/json")

def createTable(request, query, template):
    option = query.model.__name__ + "Table"
    table = eval(option + "(query, orderable=False)") # tables in the resultsWindows will not be orderable like the reference tables
    if query.model.__name__ == "League":
        table.exclude = (["created_at", "updated_at"])
    RequestConfig(request, paginate=False).configure(table) # disabling pagination so tables are all on one long, scrollable page
    tableString = render_to_string("dojo/" + template + ".html", {"table": table}, request)
    return tableString

def removePreviousCorrect(request): # remove previously saved correct answer if a new incorrect answer is entered to the same question
    if request.GET["questionNumber"] in request.session: # delete your previous correct answer if you had one
        del request.session[request.GET["questionNumber"]]

def clearSession(request):
    for key in request.session.keys():
        del request.session[key]
    return HttpResponse("django session cleared")

# questionBank was a dictionary of dictionaries before but I found that when using for key, value in template with that dictionary did not necessarily preserve the order. Iterating a list will go in order however so it's a list now
questionBank = {
    "yellow": [ # questionNumber must be in order starting with y1 for yellow, r1 for red and b1 for black. Text key is the question itself.
    {"questionNumber": "y1", "text": "Find all baseball leagues."},
    {"questionNumber": "y2", "text": "Find all womens' leagues."},
    {"questionNumber": "y3", "text": "Find all leagues where sport is any type of hockey."},
    {"questionNumber": "y4", "text": "Find all leagues where sport is something OTHER THAN football."},
    {"questionNumber": "y5", "text": 'Find all leagues that call themselves "conferences".'},
    {"questionNumber": "y6", "text": "Find all leagues in the Atlantic region."},
    {"questionNumber": "y7", "text": "Find all teams based in Dallas."},
    {"questionNumber": "y8", "text": "Find all teams named the Raptors."},
    {"questionNumber": "y9", "text": 'Find all teams whose location includes "City".'},
    {"questionNumber": "y10", "text": 'Find all teams whose names begin with "T".'},
    {"questionNumber": "y11", "text": "Return all teams, ordered alphabetically by location."},
    {"questionNumber": "y12", "text": "Return all teams, ordered by team name in reverse alphabetical order."},
    {"questionNumber": "y13", "text": 'Find every player with last name "Cooper".'},
    {"questionNumber": "y14", "text": 'Find every player with first name "Joshua".'},
    {"questionNumber": "y15", "text": 'Find every player with last name "Cooper" EXCEPT FOR Joshua.'},
    {"questionNumber": "y16", "text": 'Find all players with first name "Alexander" OR first name "Wyatt"'},
    ],
    "red": [
    {"questionNumber": "r1", "text": 'Find all teams in the Atlantic Soccer Conference.'},
    {"questionNumber": "r2", "text": 'Find all (current) players on the Boston Penguins.'},
    {"questionNumber": "r3", "text": 'Find all (current) players in the International Collegiate Baseball Conference.'},
    {"questionNumber": "r4", "text": 'Find all (current) players in the American Conference of Amateur Football with last name "Lopez".'},
    {"questionNumber": "r5", "text": 'Find all football players.'},
    {"questionNumber": "r6", "text": 'Find all teams with a (current) player named "Sophia".'},
    {"questionNumber": "r7", "text": 'Find all leagues with a (current) player named "Sophia".'},
    {"questionNumber": "r8", "text": 'Find everyone with the last name "Flores" who DOESN' + "'" + 'T (currently) play for the Washington Roughriders.'},
    ],
    "black": [
    {"questionNumber": "b1", "text": 'Find all teams, past and present, that Samuel Evans has played with.'},
    {"questionNumber": "b2", "text": 'Find all players, past and present, with the Manitoba Tiger-Cats.'},
    {"questionNumber": "b3", "text": 'Find all players who were formerly (but aren' + "'" + 't currently) with the Wichita Vikings.'},
    {"questionNumber": "b4", "text": 'Find every team that Jacob Gray played for before he joined the Oregon Colts.'},
    {"questionNumber": "b5", "text": 'Find everyone named "Joshua" who has ever played in the Atlantic Federation of Amateur Baseball Players.'},
    {"questionNumber": "b6", "text": 'Find all teams that have had 12 or more players, past and present.', "hint": 'Look up the Django "annotate" function.'}, # add a hint key to any question you want to have a hint button for (shown next to submit button). value will be the hint text to display in the resultsWindow to the right
    {"questionNumber": "b7", "text": "Show all players, sorted by the number of teams they've played for. (most to least, then by first name)"},
    ]
}

'''
Value for each key must be a valid query that in a queryset so use filter instead of get most of the time.
The only time to use get is when you will get a specific property of a record and not the whole record (ex. a player's first_name only).
Add key with name "orderMatters" (any value, I use True) for any query where correct order is required.
'''
answerBank = {
    "yellow": {
    "y1": {"answerQuery": League.objects.filter(sport="Baseball")}, # make sure answerBank entries start with key "q1" then proceed upward q2, q3, etc...
    "y2": {"answerQuery": League.objects.filter(name__icontains="women")},
    "y3": {"answerQuery": League.objects.filter(sport__icontains="hockey")},
    "y4": {"answerQuery": League.objects.exclude(sport = "Football")},
    "y5": {"answerQuery": League.objects.filter(name__icontains="conference")},
    "y6": {"answerQuery": League.objects.filter(name__icontains="Atlantic")},
    "y7": {"answerQuery": Team.objects.filter(location="Dallas")},
    "y8": {"answerQuery": Team.objects.filter(team_name__icontains="Raptors")},
    "y9": {"answerQuery": Team.objects.filter(location__icontains="city")},
    "y10": {"answerQuery": Team.objects.filter(team_name__istartswith="t")},
    "y11": {"answerQuery": Team.objects.all().order_by("location"), "orderMatters": True},
    "y12": {"answerQuery": Team.objects.all().order_by("-team_name"), "orderMatters": True},
    "y13": {"answerQuery": Player.objects.filter(last_name="Cooper")},
    "y14": {"answerQuery": Player.objects.filter(first_name="Joshua")},
    "y15": {"answerQuery": Player.objects.filter(last_name="Cooper").exclude(first_name="Joshua")},
    "y16": {"answerQuery": Player.objects.filter(Q(first_name="Alexander") | Q(first_name="Wyatt"))}, # this can also be Player.objects.filter(first_name="Alexander") | Player.objects.filter(first_name="Wyatt") without using Q class
    },
    "red": {
    "r1": {"answerQuery": Team.objects.filter(league__name="Atlantic Soccer Conference")},
    "r2": {"answerQuery": Player.objects.filter(curr_team__team_name="Penguins")},
    "r3": {"answerQuery": Player.objects.filter(curr_team__league__name="International Collegiate Baseball Conference")},
    "r4": {"answerQuery": Player.objects.filter(curr_team__league__name="American Conference of Amateur Football").filter(last_name="Lopez")},
    "r5": {"answerQuery": Player.objects.filter(curr_team__league__sport="Football")},
    "r6": {"answerQuery": Team.objects.filter(curr_players__first_name="Sophia")},
    "r7": {"answerQuery": League.objects.filter(teams__curr_players__first_name="Sophia")},
    "r8": {"answerQuery": Player.objects.filter(last_name="Flores").exclude(curr_team__team_name="Roughriders")},
    },
    "black": {
    "b1": {"answerQuery": Player.objects.get(id="115").all_teams.all()}, # get requests will work with ManyToMany because it will return a queryset of objects
    "b2": {"answerQuery": Team.objects.get(location="Manitoba").all_players.all()},
    "b3": {"answerQuery": Team.objects.get(location="Wichita").all_players.all().exclude(curr_team__location = "Wichita")},
    "b4": {"answerQuery": Player.objects.get(first_name="Jacob", last_name="Gray").all_teams.all().exclude(team_name = "Colts")},
    "b5": {"answerQuery": Player.objects.filter(first_name = "Joshua").filter(all_teams__league__id = "3")},
    "b6": {"answerQuery": Team.objects.annotate(c=Count('all_players')).filter(c__gt=11)},
    "b7": {"answerQuery": Player.objects.annotate(c=Count("all_teams")).order_by("-c", "first_name"), "orderMatters": True},
    }
}
