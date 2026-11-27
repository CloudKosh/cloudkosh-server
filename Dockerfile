# Version 1
FROM node:26-alpine
RUN apk add tini openssl 7zip

ENV POSTGRES_PASSWORD=kosh123

ENV CLOUD_KOSH_DB_DATABASE=cloudkosh
ENV CLOUD_KOSH_DB_HOST=/var/run/postgresql
ENV CLOUD_KOSH_DB_PORT=5432
ENV CLOUD_KOSH_DB_USER=postgres
ENV CLOUD_KOSH_DB_PASSWORD=kosh123
ENV CLOUD_KOSH_ADMIN_EMAIL=admin@admin

VOLUME /data
VOLUME /cache
WORKDIR /app

ENV HOST=0.0.0.0
ENV SELF_HOST=true

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm install --omit=dev --cache /root/.npm --prefer-offline

COPY index.js ./
COPY content ./content

COPY src ./src
COPY dist ./dist
COPY dev.js ./
