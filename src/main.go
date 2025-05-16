package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

var Version string

type MoistureReading struct {
	PlantID         int       `json:"plantId"`
	Moisture        int       `json:"moisture"`
	RawValue        int       `json:"rawValue"`
	ServerTimestamp time.Time `json:"serverTimestamp"`
}

func main() {
	log.Printf("Starting server version %s", Version)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from Raspberry Pi!")
	})

	http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from Raspberry Pi!")
	})

	http.HandleFunc("/api/soil-moisture-reading", handleSoilMoistureReading)

	log.Println("Server listening on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func handleSoilMoistureReading(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	var reading MoistureReading
	if err := json.Unmarshal(body, &reading); err != nil {
		log.Printf("Error parsing JSON: %v", err)
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	reading.ServerTimestamp = time.Now()

	log.Printf("Received moisture reading: Plant ID=%d, Moisture=%d%%, Raw=%d",
		reading.PlantID, reading.Moisture, reading.RawValue)

	w.WriteHeader(http.StatusCreated)
}
