# Research Opportunity Portal
**Student:** Hassan Askari  
**Course:** CN  
**Program/Class:** BS (AI 5A)  
**Semester:** Fall 2026  
**Assignment:** 01

## Project overview
A web application for managing university research opportunities. The frontend uses HTML, CSS and JavaScript; the backend is a Python Flask REST API; data is stored in MySQL.

## Requirements
- Python 3.10+
- MySQL Server and MySQL Workbench (or MySQL command-line client)
- A modern browser
- Postman

## Setup
1. Create the MySQL database and table by executing `database/schema.sql`.
2. Open a terminal in `backend`.
3. Create and activate a virtual environment (recommended):
   - Windows: `py -m venv .venv` then `.venv\Scripts\activate`
   - macOS/Linux: `python3 -m venv .venv` then `source .venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` in the `backend` folder and enter your local MySQL credentials. Do not commit `.env`.
6. Start the API from the `backend` folder: `python app.py`.
7. Serve `frontend` using VS Code Live Server or another local static web server. Open `index.html` through that server. The API defaults to `http://127.0.0.1:5000`.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/opportunities` | Create an opportunity |
| GET | `/api/opportunities` | Retrieve all opportunities |
| GET | `/api/opportunities/<id>` | Retrieve one opportunity |
| PUT | `/api/opportunities/<id>` | Update all fields of an opportunity |
| DELETE | `/api/opportunities/<id>` | Delete an opportunity |

Success and error responses use HTTP status codes including 200, 201, 400, 404 and 500. Required fields, positive positions, deadline format, and status are validated.

## Postman testing
Import `postman_collection.json` from the project root. Run the requests in order. Create at least three opportunities first. The collection demonstrates create, list, retrieve one, update, close, invalid data, delete and retrieve-after-delete (404). The collection uses IDs returned by the create requests.

## GitHub
Create your own repository and replace the placeholder repository URL here with the actual URL before submitting.

Repository: `ADD_YOUR_GITHUB_REPOSITORY_URL_HERE`

## One-minute video plan
1. Show Flask running in the terminal.
2. Show the frontend and create an opportunity.
3. Show the record in the list and open its details.
4. Edit the record and close it.
5. Delete a record.
6. Show a validation error or 404 response in Postman.
7. Briefly show the API request and response in Postman.

## Submission
Include backend, frontend, database schema, exported Postman collection, this README, your actual GitHub link, and your one-minute video/link in the final ZIP. Follow the instructor's requested ZIP naming format. This repository template has not been pushed to GitHub automatically.
