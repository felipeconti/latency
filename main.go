package main

import (
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
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	for {
		// Read message from browser
		mt, message, err := conn.ReadMessage()
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

func setupRoutes() {
	http.HandleFunc("/ws", wsEndpoint)

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)
}

func main() {
	setupRoutes()
	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
