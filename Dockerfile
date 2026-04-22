# Stage 1: Build the React Frontend
FROM node:22-alpine as build-stage
WORKDIR /app/frontend
# Copy package definitions and install
COPY simulation_app/package*.json ./
RUN npm install
# Copy the rest of the frontend source code and build it
COPY simulation_app/ ./
RUN npm run build

# Stage 2: Build the Python Backend
FROM python:3.10-slim
WORKDIR /app

# Copy pure Python dependencies and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all server backend files
COPY server.py .
COPY parkinsons_model.h5 .

# Copy the compiled React assets from Stage 1 into the static_dist folder
COPY --from=build-stage /app/frontend/dist ./static_dist

# Expose port and boot backend (which now also serves the frontend statically)
EXPOSE 5000
CMD ["python", "server.py"]