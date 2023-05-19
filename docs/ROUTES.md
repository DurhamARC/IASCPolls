# IASC API Routes

Functional routes which return a response all provide JSON Objects to the React frontend.

Functional routes which take parameters can acquire these through the `GET` request parameters (e.g. `GET /api/survey?page=1&size=10`), or within the `POST` body where this is specified. `POST` body parameters should be formatted as JSON. Lists provided to single `GET` HTTP parameters should be separated by semicolons (;). 

The icon ⚠️ indicates that the routes in the given group require login to request on. This involves the browser passing the correct session cookie. Unauthenticated route requests will return `HTTP 401 Unauthorized`.

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
# General
## CSRF Protection

__Important!__: All `POST` requests to protected routes should include the CSRF token which is set as a cookie by the `/login` route. This can be via setting the Request header `X-CSRFToken` or including `csrfmiddlewaretoken` in the `POST` body.

## Paging

`GET` API methods which can list data generally take the following optional arguments as `GET` parameters:

```javascript
page=1
size=10
```

The paging arguments are `page` and `size`. Defaults to page size of 10, if these parameters are not provided.


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
Takes a CSV or Excel spreadsheet which will be processed to populate the database. `POST` multipart form data to this route with the file attached. The form encoding type must be `multipart/form-data`.

Required multipart form fields:

 * `file` - A binary blob of the uploaded file
 * `institution` - The University name to attach participants to.

Optional multipart fields (and defaults):

 * `create_institutions` - False - Create the institution if it does not exist
 * `create_disciplines` - False - Create the disciplines (Excel Workbook sheets) if they do not exist
 * `ignore_conflicts` - False - Ignore participant uploads with conflicting Primary Key (email)


Returns a Javascript object indicating the operation's success, or an error:

```javascript
{
  "status": "success",
  "message": "File uploaded"
}
```

The expectation is that the sheet will be formatted as follows. Non-compliant sheets will be rejected with `Failure` status and an error message.

| First Name | Email Address                  | Discipline       |
|------------|--------------------------------|------------------|
| Samantha   | samantha.finnigan@durham.ac.uk | Computer Science |
| Joanne     | joanne.sheppard@durham.ac.uk   | Mathematics      |
| Peter      | peter.vickers@durham.ac.uk     | Philosophy       |

Fuzzy logic is used to detect variations on the column names: for example, "_Name_" is accepted for the name column, and "_Emial Adres_", although misspelled, would be accepted for the Email Address column. 


## Data Queries ⚠️
### List Institutions
`GET /api/institutions/`

List all institutions. Not paginated. 

Filtering is provided as an additional URL parameter, so `GET /api/institutions/1/` will specifically list details for the institution with id `1`.

```javascript
[
  {
    "id": 1,
    "name": "Durham University",
    "country": "United Kingdom"
  },{
    "id": 2,
    "name": "NYCU Taiwan",
    "country": "Taiwan"
  }
]
```

### List Disciplines
`GET /api/disciplines/`

```javascript
[
  {
    "id": 1,
    "name": "Physics"
  },
  {
    "id": 2,
    "name": "Chemistry"
  }
]
```

List all disciplines. Not paginated.

### Retrieve
`GET /api/participants/`   
Return a page of participants. Arguments are provided for pagination and filtering by institution or discipline id:

```javascript
page=1
size=10
institution=1
discipline=2
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
`GET /api/surveys/`

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


## List surveys with available results
`GET /api/survey/results/`
List surveys for which results are available; and count results for each survey.

```javascript
{
  "count": 2,
  "results": [
    {
      "id": 2,
      "question": "Question 2",
      "count": 2
    },
    {
      "id": 10,
      "question": "Test me again!",
      "count": 2
    },
  ]
}
```

## Close surveys
`POST /api/survey/close/`  
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
  "status": "success",
  "message": "Closed survey 20",
  "deleted": 1650
}
```


---
# Voting
Unprotected public route.

## Submit Vote
`POST /api/vote/`  
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
# Links
Session-authorization protected route. ⚠️

## Download unique voting links
`GET /api/links/`

Retrieve unique voting links. Takes the following arguments as GET parameters:
```javascript
survey=14
institution=1
```
Returns a JSON object with voting links, sorted or filtered by institution. 

If no data is available for the requested institution ID, returns `404 Not Found`.

### Download links as XLS Excel Sheet
`GET /api/links/xls/`

As above, but returns file download in XLS Microsoft Excel format.

### Download links as Zip File of Excel Sheets
`GET /api/links/zip/`

As above, but supports multiple Excel XLS files, separated by Institution. Can be used to download all active links for a survey without multiple requests to the server.

---
# Results
Session-authorization protected route. ⚠️

Retrieve survey results incrementally and following the close of a survey.

## Download Results
`GET /api/results/`

Provide the following parameters for survey ID, and OPTIONAL pagination:
```javascript
survey=12
page=1  *optional
size=10 *optional
```

### Download results as Microsoft Excel XLS
`GET /api/results/xls/`

As above, but get results as Microsoft Excel XLS files.

### Download results as Zip File of Excel Sheets
`GET /api/results/zip/`

Download results for surveys as Excel Spreadsheets in a zip file. To get all surveys, do not provide survey parameter


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
