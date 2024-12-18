# FROM node:16-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci && npm cache clean --force
# COPY . .
# # RUN npx prisma generate && npm run build
# # RUN npx prisma generate
# EXPOSE ${PORT}
# CMD [ "npm", "run", "start:prisma:dev" ]

FROM postgres:17

RUN apt-get clean && apt-get update && \
    apt-get install -y postgresql-contrib

ADD *.sql /docker-entrypoint-initdb.d/
