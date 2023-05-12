# IASC API Routes

Functional routes which return a response all provide JSON Objects to the React frontend.

Functional routes which take parameters can acquire these through the `GET` request parameters (e.g. `GET /api/survey?page=1&size=10`), or within the `POST` body where this is specified. `POST` body parameters should be formatted as JSON. Lists provided to single `GET` HTTP parameters should be separated by semicolons (;). 

The icon ⚠️ indicates that the routes in the given group require login to request on. This involves the browser passing the correct session cookie. Unauthenticated route requests will return `HTTP 401 Unauthorized`.


## Index:

* [Login](#login)
* [Voting](#voting)
* [Surveys](#surveys-)
  * [Create Survey](#create-survey-)
  * [List Surveys](#list-surveys-)
  * [Close Surveys](#close-surveys-)
* [Participant Data](#participant-data-)
  * [Data Entry](#data-entry-)
  * [Data Queries](#data-queries-)
* [Results](#results-)
* [Pages](#pages)


---
# Login
`POST /login`  
Get a session ID that an administrator will send as a cookie in subsequent requests to access the back-end. The `POST` body should contain the following:

```javascript
username="admin"
password="mypassword"
```

On a successful login, the server will return `302 Found` and redirect to the admin page.

---
# Voting

## Submit Vote
`POST /api/vote`  
Post a participant's vote to the server. Takes a JSON object:

```javascript
{
  "survey_id": "1234",
  "unique_id": "VGVzdGluZzEyMzQK",
  "vote": 0
}
```

For a likert-type poll, the vote can be 0-5, corresponding to "Strongly Disagree" through "Strongly Agree".

A vote can fail if either the survey has expired, or the unique ID is missing from the database (e.g. already voted). This route will as such return a response code to indicate the success/failure of the voting operation. 

```
HTTP Status 200 OK            - Vote succeeded
HTTP Status 403 Forbidden     - Vote failed
```

TBC: We could alternately return `302 Found` on success if a redirect is required.


---
# Surveys ⚠️

## Create Survey ⚠️
`POST /api/surveys`  
Create a survey in the database.

```javascript
{
    "question": "Science has proven beyond all reasonable doubt that...",
    "active": "True",
    "kind": 'LI',
    "expiry": "2023-05-01T12:34:56.789Z"
}
```

NB: Such a date can be generated in Javascript using `(new Date()).toISOString()`.

## List Surveys ⚠️

The following methods takes the following optional arguments as `GET` parameters:

```javascript
page=1  *optional
size=10 *optional
```

Optional paging arguments are `page` and `size`. Defaults to not paging, if these parameters are not provided.

### List Surveys
`GET /api/surveys`  

Returns an unfiltered list of active surveys. Keys are `survey_id`, values are data.

```javascript
{
    "1": {
        "question": "Science has proven beyond all reasonable doubt that...",
        "kind": "LI",
        "active": "True",
        "expiry": "2023-05-01T12:34:56.789Z",
        "participants": 10000,
        "voted": 6700
    },
    "2": {
        "question": "Another example question, asking about something nice?",
        "kind": "LI",
        "active": "True",
        "expiry": "2023-05-01T12:34:56.789Z",
        "participants": 10000,
        "voted": 6700
    }
}
```


## Close surveys ⚠️
`POST /api/surveys/deactivate`  
The `survey_id` field accepts an integer for survey_id, OR a list.

```javascript
{
    "survey_id": [1, 2, 4]
}
```

NB: 🛑 This is a destructive action! All data for the survey in the `active_links` table will be destroyed.


## Download unique voting links ⚠️
`GET /api/links`

Retrieve unique voting links. Takes the following arguments as GET parameters:
```javascript
survey_id=1234
institution="Durham%20University"
```
Returns a CSV file download with voting links, sorted or filtered by institution. 

If no data is available for the requested institution, returns `404 Not Found`.

---
# Participant Data ⚠️

## Data Entry ⚠️
### Upload
`POST /api/participants/upload`  
Takes a CSV or Excel spreadsheet which will be processed to populate the database.

### Status
`GET /api/participants/status`  
Processing a CSV or Excel sheet runs as a background job. The status of that job (i.e. % to completion) must be requested on this route. 

```javascript
{
  "status": "PROCESSING" | "ACCEPTED" | "FAILURE" | "SUCCESS"
}
```
The following conditions can be returned:

| Status       | Reason                                                                            |
|--------------|-----------------------------------------------------------------------------------|
| Success      | The job succeeded. The uploaded data will be available in the participant view.   |
| Failure      | The job failed. An error code will be returned                                    |
| Accepted     | The job has been scheduled to run, but has not yet started                        |
| Processing   | The job is running, data is being processed                                       |

The expectation is that the sheet will be formatted as follows, with example data provided. 
Non-compliant sheets will be rejected with `Failure` status and an error message.

| Name              | Email                          | Institution       | Discipline                 |
|-------------------|--------------------------------|-------------------|----------------------------|
| Samantha Finnigan | samantha.finnigan@durham.ac.uk | Durham University | Research Software Engineer |


## Data Queries ⚠️
### Retrieve
`GET /api/participants`   
Return a page of participants. Arguments are provided for pagination and filtering by institution or discipline:

```javascript
page=1
size=10
institution=["Durham University"]
discipline=["Biologist","Chemist"]
```

### Download CSV
`GET /api/participants/csv`  
Download a list of participants. Arguments are provide to allow filtering by institution and discipline:

```javascript
institution=["Durham University"]
discipline=["Health Scientist"]
```


---
# Results ⚠️
Retrieve survey results incrementally and following the close of a survey

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
