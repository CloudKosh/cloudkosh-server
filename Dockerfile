FROM node:26-alpine
RUN apk add --no-cache tini

ENV CASTING_SERVER_TMP_SIZE=32gb
ENV CLOUD_KOSH_DB_DATABASE=cloudkosh
ENV CLOUD_KOSH_DB_HOST=postgres
ENV CLOUD_KOSH_DB_PORT=5432
ENV CLOUD_KOSH_DB_USER=postgres
ENV CLOUD_KOSH_DB_PASSWORD=abcd123
ENV CLOUD_KOSH_ADMIN_EMAIL=admin@admin
ENV APP_HOST=v2025-test.800casting.com

ENV FILE_CONVERSION_SERVER_PORT=/fcs/sockets/fcs.sock
ENV LOCAL_CACHE_PORT=/fcs/local-cache.sock

VOLUME /data
VOLUME /cache
WORKDIR /app


ENV HOST=0.0.0.0
ENV SELF_HOST=true

EXPOSE 80 443 9229
ENTRYPOINT ["/sbin/tini", "--", "npm", "start"]

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm install --omit=dev --cache /root/.npm --prefer-offline

COPY index.js ./
COPY content ./content

COPY src ./src
COPY dist ./dist
COPY dev.js ./
