FROM node:20-alpine

WORKDIR /usr/src/app

COPY app/package*.json ./
RUN npm install --omit=dev

COPY app/ .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

EXPOSE 3000

CMD ["npm", "start"]
