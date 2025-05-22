# syntax=docker/dockerfile:1

FROM node:18 AS frontend-stage
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
RUN npm run build

FROM golang:1.24 AS build-stage
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY src/ ./src/
ARG VERSION=dev
ARG TARGETPLATFORM

RUN case "${TARGETPLATFORM}" in \
    "linux/amd64") GOARCH=amd64 ;; \
    "linux/arm64") GOARCH=arm64 ;; \
    "linux/arm/v7") GOARCH=arm GOARM=7 ;; \
    *) GOARCH=amd64 ;; \
esac && \
CGO_ENABLED=0 GOOS=linux go build -ldflags="-X main.Version=${VERSION}" -o /garden_sensor_hub ./src

FROM gcr.io/distroless/base-debian11 AS build-release-stage
WORKDIR /
COPY --from=frontend-stage /app/frontend/build /build
COPY --from=build-stage /garden_sensor_hub /garden_sensor_hub

EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT [ "/garden_sensor_hub" ]
