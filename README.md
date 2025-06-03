# Crash Store

A Django REST API for uploading, storing, retrieving, and deleting crash dump files.

---

## Frontend

---

## Backend

### Overview

* **Tech stack:** Django 5.2.1, Django REST Framework, djangorestframework-simplejwt
* **Storage layout:** Uploaded dumps are saved under `<DUMPS_BASE_DIR>/<first_char>/<second_char>/<uuid>`
* **Metadata fields:**

  * `original_name` (the uploaded filename)
  * `stored_name` (a generated UUID used on disk)
  * `time` (upload timestamp)
  * `label` (optional tag associated with the dump)
  * `archived` (boolean flag indicating if the dump has been moved to archival storage)


---

### Quick Start

#### 1. Clone & Install

```bash
git clone git@gitlab.com:simsoft/crash_store.git
cd crash_store
python3 -m venv .venv
source .venv/bin/activate
pip install django djangorestframework djangorestframework-simplejwt
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
   
   [machine]
   secret = replace-with-machine-client-secret
   email  = machine@yourdomain.com
   ```

3. **Ignore** your real config:

   ```gitignore
   config.ini
   ```

#### 3. Database & Migrations

```bash
python manage.py makemigrations
django_manage.py makemigrations accounts
python manage.py migrate
```

#### 4. Run the Server

```bash
python manage.py runserver
```

By default, the API is served at `http://127.0.0.1:8000/api/`.

---

### API Endpoints

> All endpoints expect or return JSON unless noted.

#### Authentication (public)

* **POST** `/api/auth/register/`

  ```json
  { "email": "user@example.com", "password": "SecurePass123!" }
  ```

  → creates a user, returns `{ "id": 1, "email": "user@example.com" }`

* **POST** `/api/auth/login/`

  ```json
  { "email": "user@example.com", "password": "SecurePass123!" }
  ```

  → returns `{ "refresh": "<token>", "access": "<token>" }`

* **POST** `/api/auth/refresh/`

  ```json
  { "refresh": "<token>" }
  ```

  → returns `{ "access": "<new token>" }`

* **POST** `/api/auth/client-token/`

  ```json
  { "client_secret": "replace-with-machine-client-secret" }
  ```

  → returns `{ "access": "<short-lived token>" }`

  (Used by the C++ uploader to obtain a JWT for authenticated uploads.)

#### Crash Dump Operations

* **GET** `/api/dumps/`
  List all dumps (`IsAuthenticated`)

* **POST** `/api/dumps/`
  Upload a new dump (`AllowAny`)
  Content-Type: multipart/form-data
  Form-data fields:
  • `file` = (binary file)
  • `label` = (optional string)

* **GET** `/api/dumps/{id}/`
  Retrieve a dump’s metadata (`IsAuthenticated`)

* **GET** `/api/dumps/by-label/{label}/`
  Retrieve dumps matching a label (`IsAuthenticated`)

* **GET** `/api/dumps/{id}/download/`
  Download the raw dump file (`IsAuthenticated`)

* **PUT** `/api/dumps/{id}/`
  Full replace (`IsAuthenticated`)
  Form-data fields: file + optional label

* **PATCH** `/api/dumps/{id}/`
  Partial update (`IsAuthenticated`)
  Form-data fields: file and/or label

* **DELETE** `/api/dumps/{id}/`
  Delete a dump (`IsAuthenticated`)

#### User Management (admin-only)

All endpoints under `/api/users/` require `is_staff=True`:

* **GET** `/api/users/`
  List all users

* **POST** `/api/users/`
  Create new user:

  ```json
  { "email": "new@example.com", "password": "Pass123!", "is_active": true, "is_staff": false }
  ```

* **GET** `/api/users/{id}/`
  Retrieve a single user

* **PUT** `/api/users/{id}/`
  Full update:

  ```json
  { "email": "updated@example.com", "password": "NewPass456!", "is_active": false, "is_staff": true }
  ```

* **PATCH** `/api/users/{id}/`
  Partial update, e.g.:

  ```json
  { "password": "AnotherPass789!" }
  ```

* **DELETE** `/api/users/{id}/`
  Delete user

---

### Security & Best Practices

* **Never** commit your real `SECRET_KEY`, `config.ini`, or token secrets in VCS.
* Use a **strong**, random `SECRET_KEY` (e.g. via:

  ````bash
  python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(_)"
  ````
* Short-lived `ACCESS_TOKEN_LIFETIME` and longer `REFRESH_TOKEN_LIFETIME` balance security and usability.
* In production, set `DEBUG = False` and populate `ALLOWED_HOSTS`.
* Store JWTs securely on the client (e.g. httpOnly cookies or secure storage).

---

### Directory Layout

```
backend/
├── accounts/             # custom user app
│   ├── apps.py           # AccountsConfig
│   ├── models.py         # UserManager & User model
│   ├── serializers.py    # RegistrationSerializer, AdminUserSerializer, JWT serializers
│   ├── views.py          # RegistrationView, LoginView, RefreshView, UserViewSet
│   └── urls.py?          # if split
├── config.example.ini    # template for config.ini
├── config.ini            # (ignored in Git)
├── crash_store/          # project settings & URLs
│   ├── asgi.py
│   ├── settings.py       # loads SECRET_KEY, DEBUG, DUMPS_BASE_DIR, JWT
│   ├── urls.py           # includes /api/auth/, /api/dumps/, /api/users/
│   └── wsgi.py
├── dumps/                # crash dump app
│   ├── apps.py           # DumpsConfig
│   ├── models.py         # CrashDump model
│   ├── serializers.py    # CrashDumpSerializer
│   ├── views.py          # CrashDumpViewSet
│   └── apps.py
└── manage.py             # Django CLI
```

---

### Support & Contributions

If you run into issues:

1. Verify `config.ini` exists and is valid.
2. Ensure `DUMPS_BASE_DIR` is writable.
3. Check JWT settings (`SIMPLE_JWT`) and migrations for `accounts`.
4. For machine uploads, confirm the C++ client uses the correct (`client_secret`).


Feel free to open an issue or submit a merge request on GitLab.
