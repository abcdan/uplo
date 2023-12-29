package main

import (
	"log"
	"os"
	"time"
	"uplo/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	app := fiber.New()
	app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
	}))

	err := godotenv.Load()
	if err != nil {
		log.Println("Could not load .env file, using environment variables.")
	}

	// helper.ConnectDB()

	app.Static("/", "./public")
	app.Static("/404", "./public/404.html")
	app.Static("/view", "./public/view.html")

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(200)
	})

	app.Use("/api", limiter.New(limiter.Config{
		Max:        50,
		Expiration: 1 * time.Minute,
	}))

	routes.UploadRoutes(app)
	routes.DownloadRoutes(app)

	app.Use(func(c *fiber.Ctx) error {
		if c.Path() == "*" {
			return c.SendFile("./public/404.html")
		}
		return c.Next()
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	app.Listen(":" + port)
}
