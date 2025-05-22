package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
	"time"
)

var Version string

type MoistureReading struct {
	PlantID         int       `json:"plantId"`
	Moisture        int       `json:"moisture"`
	RawValue        int       `json:"rawValue"`
	ServerTimestamp time.Time `json:"serverTimestamp"`
}

type Server struct {
	readings      map[int]MoistureReading
	readingsMutex sync.RWMutex
}

func NewServer() *Server {
	return &Server{
		readings: make(map[int]MoistureReading),
	}
}

func main() {
	port := flag.String("port", "8080", "the port to listen on")
	flag.Parse()

	log.Printf("Starting server version %s", Version)

	server := NewServer()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from Raspberry Pi!")
	})

	http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from Raspberry Pi!")
	})

	http.HandleFunc("/api/soil-moisture-reading", server.handleSoilMoistureReading)

	http.HandleFunc("/api/readings", server.getReadings)

	log.Printf("Server listening on port %s\n", *port)
	if err := http.ListenAndServe(":"+*port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func (s *Server) getReadings(w http.ResponseWriter, r *http.Request) {
	readingsArray := make([]MoistureReading, 0, len(s.readings))

	s.readingsMutex.RLock()
	defer s.readingsMutex.RUnlock()

	for _, reading := range s.readings {
		readingsArray = append(readingsArray, reading)
	}

	json.NewEncoder(w).Encode(readingsArray)
}

func (s *Server) handleSoilMoistureReading(w http.ResponseWriter, r *http.Request) {
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

	s.readingsMutex.Lock()
	s.readings[reading.PlantID] = reading
	s.readingsMutex.Unlock()

	log.Printf("Received moisture reading: Plant ID=%d, Moisture=%d%%, Raw=%d",
		reading.PlantID, reading.Moisture, reading.RawValue)

	w.WriteHeader(http.StatusCreated)
}
