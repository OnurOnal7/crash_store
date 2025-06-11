# Crash Store

A full-stack web application for uploading, storing, retrieving, and managing crash dump files.

---

## Frontend

### Tech Stack

* **Framework:** React 19.1.0 with Vite
* **Language:** TypeScript
* **UI Library:** Ant Design
* **Routing:** react-router-dom
* **State & Data Fetching:** Built-in React hooks + custom features module

### Setup & Development

1. **Navigate to the frontend folder**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

3. **Run in development mode**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Opens at `http://localhost:5173` by default.

4. **Build for production**

   ```bash
   npm run build
   # or
   yarn build
   ```

   Outputs static assets to `dist/`.

5. **Preview production build**

   ```bash
   npm run serve
   # or
   yarn serve
   ```

### Available Scripts

* `dev` : Start Vite development server with HMR.
* `build` : Bundle the app for production.
* `serve` : Preview the production build locally.

### Directory Structure

```
frontend/
├── public/             # Static assets served at root
│   └── vite.svg
├── src/
│   ├── assets/         # Images & logos
│   │   └── simsoft.jpg
│   ├── components/     # Reusable UI components
│   │   ├── LoginForm.tsx
│   │   ├── DumpList.tsx
│   │   └── ProtectedRoute.tsx
│   ├── features/       # API modules & type definitions
│   │   ├── auth/
│   │   │   ├── api.ts
│   │   │   └── types.ts
│   │   └── dumps/
│   │       ├── api.ts
│   │       └── types.ts
│   ├── pages/          # Route-level pages
│   │   ├── LoginPage.tsx
│   │   └── DumpListPage.tsx
│   ├── App.tsx         # Route definitions
│   └── main.tsx        # Entry point
├── .env                # Environment variables (VITE_API_URL)
├── index.html          # HTML template
├── package.json        # npm scripts & dependencies
├── tsconfig.json       # TypeScript config
└── vite.config.ts      # Vite config
```

### Features & Usage

* **Login Flow**

  * `LoginForm` posts to `/api/auth/login/`
  * Stores `accessToken` and `refreshToken` in `localStorage`
  * Redirects to protected routes via `ProtectedRoute`

* **Protected Routes**

  * `ProtectedRoute` component checks for `accessToken` and redirects to `/login` if missing

* **Crash Dumps Dashboard**

  * `DumpList` component fetches `/api/dumps/`
  * Displays table with sortable columns: Filename, Uploaded At, Label
  * Includes actions: Download, Delete, Archive/Unarchive
  * Shows long descriptions via popovers
  * Toggle to show archived dumps

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
  * `description` (optional text notes attached to the dump)
* **Admin panel:**  
  The Django admin is mounted at `/admin/` and exposes only the **User** model for CRUD.

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
python manage.py migrate
```

#### 4. Create an Admin User

```bash
python manage.py createsuperuser
```

#### 5. Run the Server

```bash
python manage.py runserver
```

By default, the API is served at `http://127.0.0.1:8000/api/` and the admin at `http://127.0.0.1:8000/admin/`.

---

### API Endpoints

> All endpoints expect or return JSON unless noted.

#### Authentication (public)

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

#### Crash Dump Operations (admin-only)

* **GET** `/api/dumps/`
  List all dumps

* **POST** `/api/dumps/`
  Upload a new dump
  Content-Type: multipart/form-data
  Form-data fields:

  • `file` = (binary file)

  • `label` = (optional string)

  • `description` = (optional text)

* **GET** `/api/dumps/{id}/`
  Retrieve a dump’s metadata

* **GET** `/api/dumps/by-label/{label}/`
  Retrieve dumps matching a label

* **GET** `/api/dumps/{id}/download/`
  Download the raw dump file

* **PUT** `/api/dumps/{id}/`
  Full replace 
  Form-data fields: file + optional label + optional description

* **PATCH** `/api/dumps/{id}/`
  Partial update
  Form-data fields: file and/or label and/or description

* **DELETE** `/api/dumps/{id}/`
  Delete a dump

#### User Management (admin-only)

All endpoints under `/api/users/` require `is_staff=true`:

* **GET** `/api/users/`

* **POST** `/api/users/`

* **GET** `/api/users/{id}/`

* **PUT** `/api/users/{id}/`

* **PATCH** `/api/users/{id}/`

* **DELETE** `/api/users/{id}/`

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
│   ├── admin.py          # UserAdmin registration
│   ├── models.py         # UserManager & User model
│   ├── serializers.py    # RegistrationSerializer, AdminUserSerializer, JWT serializers
│   └── views.py          # RegistrationView, LoginView, RefreshView, UserViewSet
├── config.example.ini    # template for config.ini
├── config.ini            # (ignored in Git)
├── crash_store/          # project settings & URLs
│   ├── asgi.py
│   ├── settings.py       # loads SECRET_KEY, DEBUG, DUMPS_BASE_DIR, JWT
│   ├── urls.py           # includes /admin/, /api/auth/, /api/dumps/, /api/users/
│   └── wsgi.py
├── dumps/                # crash dump app
│   ├── apps.py           # DumpsConfig
│   ├── models.py         # CrashDump model
│   ├── serializers.py    # CrashDumpSerializer
│   ├── views.py          # CrashDumpViewSet
│   └── admin.py          # (empty; CrashDump not registered)
└── manage.py             # Django CLI
```

---

### Support & Contributions

If you run into issues:

1. Verify `config.ini` exists and is valid.
2. Ensure `DUMPS_BASE_DIR` is writable.
3. Check migrations:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```
4. Confirm you have an admin user:
   ```bash
    python manage.py createsuperuser
   ```
5. For machine uploads, confirm the C++ client uses the correct (`client_secret`).


Feel free to open an issue or submit a merge request on GitLab.
