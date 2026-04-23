

FROM node:20-alpine AS development
ENV NODE_OPTIONS="--max-old-space-size=4096"
WORKDIR /usr/src/app

COPY package*.json .npmrc ./

RUN npm install glob rimraf

RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:20-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .npmrc ./

RUN npm install --only=production
EXPOSE 9001:9001

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]