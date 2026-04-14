def get_valid_slugs():
    """Return all SurveyTemplate slugs from the database.

    Falls back to an empty list if the table does not yet exist
    (e.g. during initial migrate before the SurveyTemplate migration has run).
    Validators are not called during migrations, so an empty fallback is safe.
    """
    try:
        from django.core.exceptions import AppRegistryNotReady
        from django.db import DatabaseError

        from iasc.models import SurveyTemplate

        return list(SurveyTemplate.objects.values_list("slug", flat=True))
    except (AppRegistryNotReady, DatabaseError):
        return []
