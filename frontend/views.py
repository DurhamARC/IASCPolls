from django.shortcuts import render
from django.http import JsonResponse


# Render index route (React App)
def index(request):
    return render(request, "index.html")


def poll_api(request):
    poll_id = request.GET.get('pollId')
    unique_id = request.GET.get('uniqueId')
    
    # your code here
    
    data = {
        'pollId': poll_id,
        'uniqueId': unique_id,
        # add other data as needed
    }
    
    return JsonResponse(data)
