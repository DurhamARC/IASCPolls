from builtins import issubclass

from django.contrib import admin
from iasc.models import (
    ActiveLink,
    Discipline,
    Institution,
    Participant,
    Result,
    Survey,
    SurveyTemplate,
    SurveyTemplateSlot,
)


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
    list_display = ("survey", "vote", "institution", "discipline", "added")


@admin.register(ActiveLink)
class ActiveLinkAdmin(admin.ModelAdmin):
    list_display = ("unique_link", "participant", "survey")


class SurveyTemplateSlotInline(admin.TabularInline):
    model = SurveyTemplateSlot
    extra = 0
    fields = ("order", "slot_id", "type", "placeholder")
    ordering = ("order",)


@admin.register(SurveyTemplate)
class SurveyTemplateAdmin(admin.ModelAdmin):
    list_display = ("slug", "label", "is_builtin", "created_at")
    readonly_fields = ("is_builtin", "created_at", "updated_at")
    inlines = [SurveyTemplateSlotInline]
