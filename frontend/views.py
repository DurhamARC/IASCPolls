from django.shortcuts import render


# Render index route (React App)
def index(request):
    return render(request, "index.html")

