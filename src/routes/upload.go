package routes

import (
	"io"
	"os"

	"github.com/gofiber/fiber/v2"
)

func Upload(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return err
	}

	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// hash := md5.New()
	// if _, err := io.Copy(hash, src); err != nil {
	// 	return err
	// }
	// hashInBytes := hash.Sum(nil)[:16]
	// md5Hash := hex.EncodeToString(hashInBytes)

	dst, err := os.Create("../public/uploads/" + file.Filename)
	if err != nil {
		return err
	}
	defer dst.Close()

	src.Seek(0, 0) // reset the read pointer to the start of the file
	if _, err := io.Copy(dst, src); err != nil {
		return err
	}

	return nil
}

func UploadRoutes(app *fiber.App) {
	app.Post("/api/upload", Upload)
}
