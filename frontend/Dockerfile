FROM node:alpine

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install -g @angular/cli@20.0.3

RUN npm install --legacy-peer-deps

CMD ["ng", "serve", "--host", "0.0.0.0"]
