from builtins import issubclass

from django.contrib import admin
from iasc.models import Institution, Survey, Result, Participant, Discipline, ActiveLink


@admin.register(Discipline)
class DisciplineAdmin(admin.ModelAdmin):
    list_display = ("name", "id")


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ("name", "id")


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "email", "institution", "discipline")


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "active", "expiry", "participants", "voted")


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ("unique_link", "survey", "vote", "institution", "discipline")


@admin.register(ActiveLink)
class ActiveLinkAdmin(admin.ModelAdmin):
    list_display = ("unique_link", "participant", "survey")
