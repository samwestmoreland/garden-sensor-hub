package main

import (
	"fmt"
	"log"
	"net/http"
)

var Version string

func main() {
	log.Printf("Starting server version %s", Version)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from Raspberry Pi!")
	})

	http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from Raspberry Pi!")
	})

	http.ListenAndServe(":8080", nil)
}
