# syntax=docker/dockerfile:1

FROM golang:1.24 AS build-stage

WORKDIR /app

COPY go.mod ./

RUN go mod download

COPY src/ ./src/

ARG VERSION=dev

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-X main.Version=${VERSION}" -o /garden_sensor_hub ./src

FROM gcr.io/distroless/base-debian11 AS build-release-stage

WORKDIR /

COPY --from=build-stage /garden_sensor_hub /garden_sensor_hub

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT [ "/garden_sensor_hub" ]
