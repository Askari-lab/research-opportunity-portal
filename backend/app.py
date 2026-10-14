gifrom flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
from datetime import date
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "research_portal")
    )

FIELDS = [
    "title", "description", "research_area", "faculty_name", "department",
    "required_skills", "available_positions", "application_deadline", "status"
]
REQUIRED = FIELDS[:-1]

def validate(data):
    if not isinstance(data, dict):
        return "Request body must be a JSON object."
    for field in REQUIRED:
        value = data.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            return f"'{field}' is required."
    try:
        positions = int(data["available_positions"])
        if positions < 1 or str(data["available_positions"]).strip() != str(positions):
            return "'available_positions' must be a positive whole number."
    except (ValueError, TypeError):
        return "'available_positions' must be a positive whole number."
    try:
        date.fromisoformat(str(data["application_deadline"]))
    except (ValueError, TypeError):
        return "'application_deadline' must use YYYY-MM-DD format."
    if data.get("status", "Open") not in ("Open", "Closed"):
        return "'status' must be Open or Closed."
    return None

def db_error():
    app.logger.exception("Database operation failed")
    return jsonify({"error": "Database operation failed. Check server logs."}), 500

@app.route("/api/opportunities", methods=["POST"])
def create_opportunity():
    data = request.get_json(silent=True)
    error = validate(data)
    if error:
        return jsonify({"error": error}), 400
    values = [data.get(field, "Open") for field in FIELDS]
    try:
        db = get_db()
        try:
            cursor = db.cursor()
            cursor.execute(
                """INSERT INTO opportunities
                (title, description, research_area, faculty_name, department,
                 required_skills, available_positions, application_deadline, status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""", values)
            db.commit()
            new_id = cursor.lastrowid
        finally:
            cursor.close()
            db.close()
        return jsonify({"message": "Opportunity created", "id": new_id}), 201
    except mysql.connector.Error:
        return db_error()

@app.route("/api/opportunities", methods=["GET"])
def get_all():
    try:
        db = get_db()
        try:
            cursor = db.cursor(dictionary=True)
            cursor.execute("SELECT * FROM opportunities ORDER BY id DESC")
            records = cursor.fetchall()
        finally:
            cursor.close()
            db.close()
        return jsonify(records), 200
    except mysql.connector.Error:
        return db_error()

@app.route("/api/opportunities/<int:opp_id>", methods=["GET"])
def get_one(opp_id):
    try:
        db = get_db()
        try:
            cursor = db.cursor(dictionary=True)
            cursor.execute("SELECT * FROM opportunities WHERE id=%s", (opp_id,))
            record = cursor.fetchone()
        finally:
            cursor.close()
            db.close()
        if record is None:
            return jsonify({"error": "Opportunity not found"}), 404
        return jsonify(record), 200
    except mysql.connector.Error:
        return db_error()

@app.route("/api/opportunities/<int:opp_id>", methods=["PUT"])
def update_opportunity(opp_id):
    data = request.get_json(silent=True)
    error = validate(data)
    if error:
        return jsonify({"error": error}), 400
    values = [data.get(field, "Open") for field in FIELDS]
    try:
        db = get_db()
        try:
            cursor = db.cursor()
            cursor.execute(
                """UPDATE opportunities SET title=%s, description=%s, research_area=%s,
                faculty_name=%s, department=%s, required_skills=%s,
                available_positions=%s, application_deadline=%s, status=%s
                WHERE id=%s""", values + [opp_id])
            db.commit()
            changed = cursor.rowcount
            if changed == 0:
                cursor.execute("SELECT id FROM opportunities WHERE id=%s", (opp_id,))
                exists = cursor.fetchone()
            else:
                exists = True
        finally:
            cursor.close()
            db.close()
        if not exists:
            return jsonify({"error": "Opportunity not found"}), 404
        return jsonify({"message": "Opportunity updated"}), 200
    except mysql.connector.Error:
        return db_error()

@app.route("/api/opportunities/<int:opp_id>", methods=["DELETE"])
def delete_opportunity(opp_id):
    try:
        db = get_db()
        try:
            cursor = db.cursor()
            cursor.execute("DELETE FROM opportunities WHERE id=%s", (opp_id,))
            db.commit()
            deleted = cursor.rowcount
        finally:
            cursor.close()
            db.close()
        if deleted == 0:
            return jsonify({"error": "Opportunity not found"}), 404
        return jsonify({"message": "Opportunity deleted"}), 200
    except mysql.connector.Error:
        return db_error()

@app.errorhandler(404)
def route_not_found(_error):
    return jsonify({"error": "Route not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)
