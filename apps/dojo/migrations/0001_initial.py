# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-03-27 04:37
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='League',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('sport', models.CharField(max_length=15)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=15)),
                ('last_name', models.CharField(max_length=15)),
            ],
        ),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('location', models.CharField(max_length=50)),
                ('team_name', models.CharField(max_length=50)),
                ('league', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='teams', to='dojo.League')),
            ],
        ),
        migrations.AddField(
            model_name='player',
            name='all_teams',
            field=models.ManyToManyField(related_name='all_players', to='dojo.Team'),
        ),
        migrations.AddField(
            model_name='player',
            name='curr_team',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='curr_players', to='dojo.Team'),
        ),
    ]
