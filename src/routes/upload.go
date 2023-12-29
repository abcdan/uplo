package routes

import (
	"crypto/md5"
	"encoding/hex"
	"io"
	"os"

	"github.com/gofiber/fiber/v2"
)

func Upload(c *fiber.Ctx) error {
	form, err := c.MultipartForm()
	if err != nil {
		return err
	}
	file := form.File["file"][0]

	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create("./public/uploads/" + file.Filename)
	if err != nil {
		return err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return err
	}
	src.Close()
	dst.Close()

	hasher := md5.New()
	io.Copy(hasher, src)
	md5 := hex.EncodeToString(hasher.Sum(nil))

	domain := os.Getenv("DOMAIN")
	url := "https://" + domain + "/view/" + file.Filename

	return c.JSON(fiber.Map{
		"url":      url,
		"md5":      md5,
		"filesize": file.Size,
		"filename": file.Filename,
	})
}

func UploadRoutes(app *fiber.App) {
	app.Post("/api/upload", Upload)
}
