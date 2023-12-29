package routes

import (
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

func Download(c *fiber.Ctx) error {
	fileName := c.Params("file")
	filePath := os.Getenv("UPLOADS_PATH") + "/" + fileName

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return c.Status(http.StatusNotFound).SendString("File not found")
	}

	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	return c.Download(filePath)
}

func DownloadRoutes(app *fiber.App) {
	app.Use("/api/download/:file", limiter.New(limiter.Config{
		Max:        10,
		Expiration: 1 * time.Minute,
	}))
	app.Get("/api/download/:file", Download)
}
