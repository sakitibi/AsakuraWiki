package wiki_v3

import (
	"database/sql"
	"os"
	"sync"
	"time"

	_ "github.com/tursodatabase/go-libsql"
)

var (
	db        *sql.DB
	once      sync.Once
	dbInitErr error
)

func GetDB() (*sql.DB, error) {
	once.Do(func() {
		tursoURL := os.Getenv("NEXT_PUBLIC_TURSO_DATABASE_URL")
		tursoToken := os.Getenv("NEXT_PUBLIC_TURSO_AUTH_TOKEN")

		connStr := tursoURL + "?authToken=" + tursoToken
		var err error
		db, err = sql.Open("libsql", connStr)
		if err != nil {
			dbInitErr = err
			return
		}

		db.SetMaxOpenConns(10)
		db.SetMaxIdleConns(5)
		db.SetConnMaxLifetime(3 * time.Minute)
	})
	return db, dbInitErr
}
