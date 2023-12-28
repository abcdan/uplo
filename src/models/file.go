package models

import "time"

type File struct {
	ID        string    `bson:"ID"`
	MD5       string    `bson:"md5"`
	FileSize  int64     `bson:"filesize"`
	CreatedAt time.Time `bson:"created_at"`
	IP        string    `bson:"ip,omitempty"`
}
