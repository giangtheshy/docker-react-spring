FROM node:14.17.1-alpine3.11 as builder

LABEL version="1.0"
LABEL description="React Front End Phim pro"

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY . .

RUN npm run build


FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html