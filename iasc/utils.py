# utils.py
from django.core.exceptions import ValidationError
from rest_framework.request import Request


def get_error_message(e: Exception):
    """
    Some error messages have a .message attribute.
    Use that if it's available, else use the str representation.
    @param e: Exception
    @return: String with the error message
    """
    return e.message if hasattr(e, "message") else str(e)


def request_has_keys(request: Request, fields: set):
    """
    Check if the given set of fields is in a request object's data
    @param request:
    @param fields:
    @return:
    """
    keys = request.data.keys()
    if not fields <= set(keys):
        fields = fields.difference(keys)
        raise ValidationError(f"Upload form missing required fields: {fields}")


def validate_string(string, name):
    """
    Validate a variable as a string of >0 length
    @param string:
    @param name:
    @return:
    """
    if type(string) is not str or not len(string.strip()):
        raise ValidationError(f"{name} must be a string of >0 length.")


def validate_int(integer, name, positive=False):
    """
    Validate an integer
    @param integer:
    @param name:
    @param positive:
    @return:
    """
    if type(integer) is not int and not int(integer):
        raise ValidationError(
            f"{name} must be a {'positive ' if positive else ''}integer. Got {type(integer)}."
        )


def to_boolean(request, key):
    """
    Turn a request parameter into a boolean
    @param request:
    @param key:
    @return:
    """
    ret = request.data.get(key, False)
    if type(ret) == bool:
        return ret
    if type(ret) == str:
        return ret.lower() in ["1", "true", "yes"]
    if type(ret) == int:
        return ret == 1
    return False
