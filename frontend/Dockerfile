# Multi-stage: build the Vite app (VITE_API_URL is baked in at build time),
# then serve the static output with nginx. HTTPS is terminated by the host
# (Railway) which forwards plain HTTP to this container on port 80.
FROM node:22-alpine AS build
WORKDIR /app

# VITE_API_URL is required: the bundled app must point at the deployed API,
# never at localhost. Fail the build if it is not provided.
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "ERROR: VITE_API_URL build arg is required (deployed API origin, e.g. https://<api>.up.railway.app)." && exit 1)

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN VITE_API_URL="$VITE_API_URL" npm run build

FROM nginx:alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80