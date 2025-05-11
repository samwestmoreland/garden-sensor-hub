# syntax=docker/dockerfile:1

FROM golang:1.24 AS build-stage

WORKDIR /app

COPY go.mod ./

RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /simple_server

FROM gcr.io/distroless/base-debian11 AS build-release-stage

WORKDIR /

COPY --from=build-stage /simple_server /simple_server

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/simple_server"]
