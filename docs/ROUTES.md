# IASC API Routes

Functional routes which return a response all provide JSON Objects to the React frontend.

Functional routes which take parameters can acquire these through the `GET` request parameters (e.g. `GET /api/survey?page=1&size=10`), or within the `POST` body where this is specified. `POST` body parameters should be formatted as JSON. Lists provided to single `GET` HTTP parameters should be separated by semicolons (;). 

The icon ⚠️ indicates that the routes in the given group require login to request on. This involves the browser passing the correct session cookie. Unauthenticated route requests will return `HTTP 401 Unauthorized`.

All requests to these protected routes should include the CSRF token which is set as a cookie by the `/login` route. This can be via setting the Request header `X-CSRFToken` or including `csrfmiddlewaretoken` in the `POST` body.

## Index:

* [Login](#login)
  * [Logout](#logout) 
* [Participants](#participants)
  * [Data Entry](#data-entry-)
  * [Data Queries](#data-queries-)
* [Surveys](#surveys-)
  * [Create Survey](#create-survey-)
  * [List Surveys](#list-surveys-)
  * [Close Surveys](#close-surveys-)
* [Voting](#voting) 
* [Results](#results-)
* [Pages](#pages)


---
# Login
`POST /login/`  
Get a session ID that an administrator will send as a cookie in subsequent requests to access the back-end. The `POST` body should contain the following:

```javascript
username="admin"
password="mypassword"
```

On a successful login, the server will return `302 Found` and redirect to the admin page.

## Logout
`GET /logout/`
Log the user out of the application, invalidating the session cookie from the `/login` route. The server will return a `302 Found` redirect to the `/` index of the web application.


---
# Participants
Session-authorization protected route. ⚠️

## Data Entry
### Upload
`POST /api/participants/upload/`  
Takes a CSV or Excel spreadsheet which will be processed to populate the database.

Returns a Javascript object indicating the operation's success, or an error:

```javascript
{
    "status": "success",
    "message": "File uploaded"
}
```

The expectation is that the sheet will be formatted as follows, with example data provided. 
Non-compliant sheets will be rejected with `Failure` status and an error message.

| Name              | Email                          | Institution       | Discipline                 |
|-------------------|--------------------------------|-------------------|----------------------------|
| Samantha Finnigan | samantha.finnigan@durham.ac.uk | Durham University | Research Software Engineer |


## Data Queries ⚠️
### Retrieve
`GET /api/participants/`   
Return a page of participants. Arguments are provided for pagination and filtering by institution or discipline id:

```javascript
page=1
size=10
institution=1
discipline=2
```

### Download CSV
`GET /api/participants/xls/`  
Download a list of participants. Arguments are provide to allow filtering by institution and discipline:

```javascript
institution=["Durham University"]
discipline=["Health Scientist"]
```


---
# Surveys
Session-authorization protected route. ⚠️

## Create Survey
`POST /api/survey/create/`  
Create a survey in the database.

```javascript
{
    "question": "Science has proven beyond all reasonable doubt that...",
    "active": "True",
    "kind": 'LI',
    "expiry": "2023-05-01T12:34:56"
}
```

NB: Such a date can be generated in Javascript using `(new Date()).toISOString()`.

There are further optional parameters which can be given to this route:

```javascript
{
    "create_active_links": "True"
}
```

This will allow you to create a survey without creating ActiveLinks in the database.

## List Surveys

The following methods takes the following optional arguments as `GET` parameters:

```javascript
page=1  *optional
size=10 *optional
```

Optional paging arguments are `page` and `size`. Defaults to page size of 10, if these parameters are not provided.

### List Surveys
`GET /api/surveys`

Takes the optional `GET` parameter `?active=True`.

Returns a filtered list of active surveys, accessible under the key `results`, values are data.

```javascript
{
  "results": [
    {
      "id": 1,
      "question": "Science has proven beyond all reasonable doubt that...",
      "kind": "LI",
      "active": "True",
      "expiry": "2023-05-01T12:34:56.789Z",
      "participants": 10000,
      "voted": 6700
    },
    {
      "id": 2,
      "question": "Another example question, asking about something nice?",
      "kind": "LI",
      "active": "True",
      "expiry": "2023-05-01T12:34:56.789Z",
      "participants": 10000,
      "voted": 6700
    }
  ]
}
```


## Close surveys
`POST /api/survey/close`  
The `survey` field accepts an integer for the survey id.

```javascript
{
    "survey": 2
}
```

🛑 This is a destructive action! All data for the survey in the `active_links` table will be destroyed.

Returns a JSON object to verify success, and how many ActiveLinks were deleted:
```javascript
{
  "status":"success",
  "message":"Closed survey 20",
  "deleted":1650
}
```


---
# Links
Session-authorization protected route. ⚠️

## Download unique voting links
`GET /api/links`

Retrieve unique voting links. Takes the following arguments as GET parameters:
```javascript
survey_id=1234
institution="Durham%20University"
```
Returns a CSV file download with voting links, sorted or filtered by institution. 

If no data is available for the requested institution, returns `404 Not Found`.

---
# Voting
Unprotected public route.

## Submit Vote
`POST /api/vote`  
Post a participant's vote to the server. Takes a JSON object:

```javascript
{
  "unique_id": "zz6jz-GYzud9FApJ2cBLK4vHiP7E8t7tJELs6Wq75Zc",
  "vote": 0
}
```

For a likert-type poll, the vote can be 0-5, corresponding to "Strongly Disagree" through "Strongly Agree".

A vote can fail if either the survey has expired, or the unique ID is missing from the database (e.g. already voted). This route will as such return a response code to indicate the success/failure of the voting operation. 

```
HTTP Status 200 OK            - Vote succeeded
HTTP Status 403 Forbidden     - Vote failed
```

---
# Results
Session-authorization protected route. ⚠️

Retrieve survey results incrementally and following the close of a survey.

## Download Results
`GET /api/results`

Provide the following parameters for survey ID, and OPTIONAL pagination:
```javascript
survey_id=1234
page=1  *optional
size=10 *optional
```


---
# Pages
The following routes return pages in the React web application:

| Page                    | Description                                                    |
|-------------------------|----------------------------------------------------------------|
| /                       | Home page                                                      |
| /about                  | About the project                                              |
| /ethics                 | Ethics statement                                               |
| /login                  | Log into the administrative interface                          |
| /poll                   | Respond to a survey                                            |
| /dashboard/             | Administrative dashboard, shows available options after login  |
| /dashboard/survey       | Perform survey administration actions: create, list, close     |
| /dashboard/participants | Administer participants: upload CSV or Excel spreadsheet       |
| /dashboard/results      | Retrieve survey results, while survey running or after closure |
