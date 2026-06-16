FROM python:3.11-slim

# Install system dependencies for OCR and PDF processing
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy python dependencies list and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Set dynamic port compatibility for Render (defaults to 8000 if not specified)
ENV PORT=8000
EXPOSE 8000

# Start FastAPI application
CMD sh -c "uvicorn app:app --host 0.0.0.0 --port $PORT"
