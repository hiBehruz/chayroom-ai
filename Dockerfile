FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY .output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
