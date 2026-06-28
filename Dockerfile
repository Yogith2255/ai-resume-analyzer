# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend-react/package*.json ./
RUN npm ci
COPY frontend-react/ ./
RUN npm run build

# Stage 2: Create runtime environment
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY backend/ ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend-react/dist

# Expose server port
EXPOSE 3000

# Set environment defaults
ENV PORT=3000
ENV NODE_ENV=production
ENV DATABASE_PATH=/data/career-lens.db
ENV UPLOAD_DIR=/data/resumes

CMD ["node", "backend/server.js"]
