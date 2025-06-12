FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
ENV DJANGO_SETTINGS_MODULE=crash_store.settings
ENTRYPOINT ["gunicorn", "crash_store.wsgi:application", "--bind", "0.0.0.0:8000"]
