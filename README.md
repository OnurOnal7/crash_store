# Crash Store

A Django REST API for uploading, storing, retrieving, and deleting crash dump files.

---

## Frontend

*To be implemented.*

---

## Backend

### Overview

* **Tech stack:** Django 5.2.1, Django REST Framework
* **Storage layout:** Uploaded dumps are saved under `<DUMPS_BASE_DIR>/<first_char>/<second_char>/<uuid>`
* **Metadata fields:**

  * `original_name` (the uploaded filename)
  * `stored_name` (a generated UUID used on disk)
  * `time` (upload timestamp)
  * `label` (optional tag associated with the dump)

---

### Quick Start

#### 1. Clone & Install

```bash
git clone git@gitlab.com:simsoft/crash_store.git
cd crash_store
python3 -m venv .venv
source .venv/bin/activate
pip install django djangorestframework
```

#### 2. Configuration

1. Copy the template:

   ```bash
   cp config.example.ini config.ini
   ```
2. **Edit** `config.ini`:

   ```ini
   [paths]
   dumps_dir = /absolute/path/to/your/dumps
   
   [django]
   SECRET_KEY = replace-with-a-secure-random-string
   DEBUG = True
   ```
3. **Ignore** your real config:

   ```gitignore
   config.ini
   ```

#### 3. Database & Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 4. Run the Server

```bash
python manage.py runserver
```

By default, the API is served at `http://127.0.0.1:8000/api/dumps/`.

---

### API Endpoints

> All endpoints expect or return JSON unless noted.

#### List dumps

```
GET /api/dumps/
```

#### Upload a new dump

```
POST /api/dumps/
Content-Type: multipart/form-data
Form-data fields:
  • file = (binary file)
  • label = (optional string)
```

#### Retrieve a dump’s metadata

```
GET /api/dumps/{id}/
```

#### Retrieve dumps by label

```
GET /api/dumps/by-label/{label}/
```

#### Download the raw dump file

```
GET /api/dumps/{id}/download/
```

Returns a `FileResponse` with `Content-Disposition: attachment; filename=<original_name>`

#### Full replace (PUT)

```
PUT /api/dumps/{id}/
Content-Type: multipart/form-data
Form-data fields:
  • file = (new binary file)
  • label = (optional string)
```

#### Partial update (PATCH)

```
PATCH /api/dumps/{id}/
Content-Type: multipart/form-data
Form-data fields:
  • file = (optional new file)
  • label = (optional string)
```

#### Delete a dump

```
DELETE /api/dumps/{id}/
```

Returns the deleted object’s metadata JSON and schedules the disk file for removal after the database commit.

---

### Security & Best Practices

* **Never** commit your real `SECRET_KEY` or `config.ini`.
* Use a **strong**, random `SECRET_KEY` (e.g. via:
```
python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
* In production, set `DEBUG = False` and populate `ALLOWED_HOSTS` with your real domain(s).

---

### Directory Layout

```
backend/
├── config.example.ini    # template for config.ini
├── config.ini            # (ignored in Git)
├── manage.py             # Django CLI
├── crash_store/          # project settings & URLs
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py       # loads SECRET_KEY, DEBUG, DUMPS_BASE_DIR from config.ini
│   ├── urls.py           # includes /api/dumps/ routes
│   └── wsgi.py
└── dumps/                # Django app for crash dumps
    ├── __init__.py
    ├── admin.py          # admin registration
    ├── apps.py           # app configuration
    ├── models.py         # CrashDump model
    ├── serializers.py    # CrashDumpSerializer (read-only fields)
    ├── tests.py          # tests for CrashDump API
    └── views.py          # CrashDumpViewSet
```

---

### Support & Contributions

If you run into issues:

1. Verify `config.ini` exists and is valid.
2. Ensure `DUMPS_BASE_DIR` is writable and correct.
3. Check server logs for errors.

Feel free to open an issue or submit a merge request on GitLab.
