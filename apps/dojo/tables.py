import django_tables2 as tables
from .models import League, Team, Player

class LeagueTable(tables.Table):
    id = tables.Column(verbose_name="id")
    name = tables.Column(verbose_name="name")
    sport = tables.Column(verbose_name="sport")
    created_at = tables.Column(verbose_name="created_at")
    updated_at = tables.Column(verbose_name="updated_at")

    class Meta:
        model = League
        attrs = {'class': 'paleblue'}
        order_by = "id" # There seems to be a bug in tables2 where the id column in each table always took two clicks to work the first time after page loaded. After that it continued to work normally until you navigated to another page and then back where the bug would reoccur. Specifying to order each table by id initially seems to work around this
        # orderable = False # will disable sorting in tables because the sort link cause a page refresh and aren't needed for this project
        # remarked out above line because I ended up enabling sorting on the reference tables and disabling on the answerTables by providing orderable=False in the createTable function

class TeamTable(tables.Table):
    id = tables.Column(verbose_name = "id")
    location = tables.Column(verbose_name="location")
    team_name = tables.Column(verbose_name="team_name")
    league = tables.Column(accessor = 'league.name', verbose_name = 'league (object)')

    class Meta:
    	model = Team
    	attrs = {'class': 'paleblue'}
        order_by = "id"
        # orderable = False # this can also be called on a one off basis with the table constructor but putting it here disables it for every table made from this model

class PlayerTable(tables.Table):
    id = tables.Column(verbose_name = "id")
    first_name = tables.Column(verbose_name = "first_name")
    last_name = tables.Column(verbose_name = "last_name")
    curr_team = tables.Column(accessor = 'curr_team.team_name', verbose_name = 'curr_team (object)')

    class Meta:
    	model = Player
    	attrs = {'class': 'paleblue'}
        order_by = "id"
        # orderable = False

'''
I simply could NOT find a way to have tables2 just use the model attribute as the column header. It always wanted to "titleise" them by using capital letters,
removing underscores, etc. I wanted to use the attribute names to make it easier for users to know the correct attribute names to plug in when making queries.
'''
