#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
python3.9 -m pip install -r requirements.txt

# Create static files directory if not exists
mkdir -p staticfiles

# Collect static files
echo "Collecting static files..."
python3.9 manage.py collectstatic --noinput

# Run migrations (Note: sqlite won't persist, but this ensures the schema is ready for the session)
echo "Running migrations..."
python3.9 manage.py migrate --noinput

echo "Build sequence complete."
