# Build Stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# You can bypass Gemini key for local build if only using Ollama
ENV VITE_DISABLE_ESLINT=true
RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config if needed, otherwise default is usually fine for SPA without client-side routing
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
