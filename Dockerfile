FROM node:lts-alpine3.15

WORKDIR /app/

COPY . /app

ENV PORT=3030
ENV API_PORT=4040

EXPOSE 3030 4040

RUN npm install
RUN npm install pm2 -g

COPY --chown=node:node ./start.sh /app/start.sh
RUN chmod +x ./start.sh
CMD ./start.sh