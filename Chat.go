package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"golang.org/x/net/websocket"
)

var Count = 0
var Client = make([]*websocket.Conn, 20)

type Data struct {
	Messages []string
	Length   int
}

var History Data

func Trim(mas []byte, count int) []byte {
	res := make([]byte, count)
	for i := 0; i < count; i++ {
		res[i] = mas[i]
	}
	return res
}

func Server(w http.ResponseWriter, r *http.Request) {
	file, err := os.Open("./Chat.html")
	if err != nil {
		log.Fatal("Не удалось найти файл с страницей")
		return
	}
	defer file.Close()
	io.Copy(w, file)
}

func ChatServer(ws *websocket.Conn) {
	FrameMessage := make([]byte, 150)
	flag := true
	Client[Count] = ws
	Count++
	for {
		n, err := ws.Read(FrameMessage)

		if err != nil {
			log.Println("Неудалось прочитать кадр сообщения")
			ws.Close()
		}
		History.Messages = append(History.Messages, string(Trim(FrameMessage, n)))
		History.Length++
		if flag {
			for j := 1; j < History.Length-1; j++ {
				ws.Write([]byte(History.Messages[j]))
			}
			flag = false
		}
		for i := 0; i <= Count-1; i++ {
			Client[i].Write(Trim(FrameMessage, n))
		}
	}
}

func main() {
	History.Length = 0
	Src := http.FileServer(http.Dir("./Scripts"))
	http.Handle("/Scripts/", http.StripPrefix("/Scripts", Src))
	fmt.Println("Server working...")
	http.HandleFunc("/", Server)
	http.Handle("/ws", websocket.Handler(ChatServer))
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(" Не удается прослушивать порт")
		return
	}
}
