# Crash Store

## Prerequisites

- Docker & Docker Compose
- Node.js (v16+) + npm
- Python 3.11 + pip
- Django (`pip install django`)
- Nginx

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/<github-username>/crash_store.git
   cd crash_store
   ```

2. **Prepare Host Service Directory**
   ```bash
   # Windows PowerShell
   mkdir $Env:USERPROFILE\srv\crash_store\data\dumps
   mkdir $Env:USERPROFILE\srv\crash_store\frontend\dist
   mkdir $Env:USERPROFILE\srv\crash_store\certs
   ```

3. **Copy Config & DB**
   ```bash
   cp backend/config.example.ini ~/srv/crash_store/config.ini
   cp backend/db.sqlite3 ~/srv/crash_store/db.sqlite3
   ```

4. **Edit `~/srv/crash_store/config.ini`**
   ```ini
   [paths]
   dumps_dir = data/dumps
   
   [django]
   SECRET_KEY = <your-secret-key>
   DEBUG = False

   [machine]
   secret = <shared-secret>
   email = <machine-email>
   ```

5. **Allow your host in Django**
   In `backend/crash_store/settings.py`, update:
   ```ini
   ALLOWED_HOSTS = [
   'localhost',
   '127.0.0.1',
   '<your-server-ip>',
   '<your-server-hostname>',
   ]
   ```

6. **Build & run backend container**
   ```bash
   cd backend
   # optional local venv
   python3 -m venv .venv
   source .venv/bin/activate     # Windows: .venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser  # optional
   cd ..
   docker compose up -d --build backend
   ```
   - Backend API → http://localhost:8000/api/

7. **Build frontend & copy assets**
   ```bash
   cd frontend
   npm ci
   npm run build
   # copy built files into your host folder:
   cp -R dist/* ~/srv/crash_store/frontend/dist/
   cd ..
   ```

8. **Configure `docker-compose.yml`**

   Open `docker-compose.yml` and replace the backend `volumes` with your host paths: 
   ```yaml
   services:
    backend:
     build:
      context: ./backend
     container_name: crash-store-backend
     ports:
      - "8000:8000"
     volumes:
      - /home/<you>/srv/crash_store/config.ini:/app/config.ini:ro
      - /home/<you>/srv/crash_store/db.sqlite3:/app/db.sqlite3
      - /home/<you>/srv/crash_store/data/dumps:/app/data/dumps
     environment:
      DJANGO_SETTINGS_MODULE: crash_store.settings
    
    frontend:
     build:
      context: ./frontend
     container_name: crash-store-frontend
     ports:
      - "3000:80"
     depends_on:
      - backend
    
    proxy:
     image: nginx:alpine
     container_name: crash-store-proxy
     ports:
      - "80:80"
      - "443:443"
     volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
     depends_on:
      - backend
      - frontend
   ```

9. **Bring up all services**
   ```bash
   docker compose up -d --build
   ```

10. **Host-machine Nginx**
   `/etc/nginx/conf.d/crash_store.conf`:
   ```nginx
   server {
     listen 80;
     server_name localhost; # or your LAN hostname/IP

     # Proxy API → Django container
     location /api/ {
       proxy_pass http://127.0.0.1:8000/api/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }

     # Serve React static files
     location / {
       root /home/<you>/srv/crash_store/frontend/dist;
       index index.html;    
       try_files $uri $uri/ /index.html;
     }
   }
   ```
   Reload nginx:
   ```bash
   sudo nginx -s reload   # macOS/Linux
   ```

11. **Optional HTTPS**
    - Place your `fullchain.pem` & `privkey.pem` into `~/srv/crash_store/certs/`
    - Add your server block:
       ```nginx
       listen 443 ssl http2;
       ssl_certificate /home/<you>/srv/crash_store/certs/fullchain.pem;
       ssl_certificate_key /home/<you>/srv/crash_store/certs/privkey.pem;
       ```
    - Reload nginx.

---