package db

import (
    "context"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "log"
    "time"
)

var Client *mongo.Client

func Connect(uri string) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
    if err != nil {
        log.Fatal("MongoDB connection failed:", err)
    }
    err = client.Ping(ctx, nil)
    if err != nil {
        log.Fatal("MongoDB ping failed:", err)
    }
    Client = client
    log.Println("MongoDB connected successfully")
}
