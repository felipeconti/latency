package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	log.Printf("Method: %v | Proto: %v | Host: %v | RequestURI: %v | Headers: %v",
		r.Method, r.Proto, r.Host, r.RequestURI, r.Header)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	for {
		// Read message from browser
		mt, message, err := conn.ReadMessage()
		log.Println("Message:", message)
		if err != nil {
			log.Println("Error reading message:", err)
			break
		}

		// Write message back to browser
		err = conn.WriteMessage(mt, message)
		if err != nil {
			log.Println("Error writing message:", err)
			break
		}
	}
}

func health(w http.ResponseWriter, r *http.Request) {
	msg := `{"Method":"%v","Proto":"%v","Host":"%v","RequestURI":"%v","Headers":"%s"}`
	log.Printf(msg, r.Method, r.Proto, r.Host, r.RequestURI, r.Header)
	fmt.Fprintf(w, msg, r.Method, r.Proto, r.Host, r.RequestURI, r.Header)
}

func setupRoutes() {
	http.HandleFunc("/ws", wsEndpoint)
	http.HandleFunc("/health", health)

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)
}

func main() {
	setupRoutes()
	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
