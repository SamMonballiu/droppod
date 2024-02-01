package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"path"

	"encoding/json"

	"github.com/disintegration/imaging"
)

type FilesResponse struct {
	Freespace int64      `json:"freeSpace"`
	Contents  FolderInfo `json:"contents"`
}

type Dimensions struct {
	Width       int  `json:"width"`
	Height      int  `json:"height"`
	Orientation byte `json:"orientation"`
}

type FileInfo struct {
	Filename     string    `json:"filename"`
	FullPath     string    `json:"fullPath"`
	RelativePath string    `json:"relativePath"`
	Extension    string    `json:"extension"`
	Size         int64     `json:"size"`
	DateAdded    time.Time `json:"dateAdded"`
	IsFolder     bool      `json:"isFolder"`
	Rating       byte      `json:"rating"`
	// Dimensions   *Dimensions `json:"dimensions"`
}

type FolderInfo struct {
	Name      string       `json:"name"`
	Parent    string       `json:"parent"`
	Files     []FileInfo   `json:"files"`
	Folders   []FolderInfo `json:"folders"`
	DateAdded time.Time    `json:"dateAdded"`
}

func main() {
	http.HandleFunc("/list", listHandler)
	//http.HandleFunc("/thumbnail", thumbnailHandler)
	fmt.Println("Listening on port 5566...")
	http.ListenAndServe(":5566", nil)
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	basePath := r.URL.Query().Get("basePath")
	fullPath := filepath.Join(basePath, path)
	//fmt.Printf("BasePath: %v ][ Path: %v ][ FullPath: %v\n", basePath, path, fullPath)
	if path == "" || basePath == "" {
		http.Error(w, "Missing path/basePath parameter", http.StatusBadRequest)
		return
	}

	//fmt.Println(filepath.Dir(path))
	//fmt.Println(strings.Replace(filepath.Dir(fullPath), basePath, "", 1))

	files, err := os.ReadDir(fullPath)
	if err != nil {
		fmt.Println(err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var folderInfo FolderInfo
	subFolders := make([]FolderInfo, 0)
	subFiles := make([]FileInfo, 0)
	folderInfo = FolderInfo{Name: path, Parent: filepath.Dir(path)[1:]}

	for _, file := range files {
		if file.IsDir() {
			folderInfo := FolderInfo{
				Name:      file.Name(),
				Parent:    path[1:],
				Files:     make([]FileInfo, 0),
				Folders:   make([]FolderInfo, 0),
				DateAdded: time.Now(),
			}
			subFolders = append(subFolders, folderInfo)
		} else {
			info, _ := file.Info()
			filename := file.Name()
			// isImage, height, width, orientation := checkImageProperties(filepath.Join(fullPath, filename))

			fileInfo := FileInfo{
				Filename:     filename,
				FullPath:     filepath.Join(path, filename),
				RelativePath: path,
				Extension:    filepath.Ext(filename),
				Size:         info.Size(),
				DateAdded:    info.ModTime(),
				Rating:       0,
			}
			// if isImage {
			// 	fileInfo.Dimensions = &Dimensions{Height: height, Width: width, Orientation: orientation}
			// }

			subFiles = append(subFiles, fileInfo)
		}
	}
	folderInfo.Files = subFiles
	folderInfo.Folders = subFolders
	response := FilesResponse{
		Freespace: 0,
		Contents:  folderInfo,
	}
	jsonBytes, _ := json.MarshalIndent(response, "", "")
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonBytes)
}

// This function takes a file path as a string and returns a boolean indicating whether it is an image file, and if so, its height, width and orientation as integers.
func checkImageProperties(filePath string) (bool, int, int, byte) {
	// Get the file extension from the file path
	ext := strings.ToLower(path.Ext(filePath))

	// Check if the extension is one of the supported image formats
	if ext == ".gif" || ext == ".jpg" || ext == ".jpeg" || ext == ".png" {
		// Open the file and decode it as an image
		file, err := os.Open(filePath)
		if err != nil {
			// Handle the error
			return false, 0, 0, 0
		}
		defer file.Close()

		config, _, err := image.DecodeConfig(file)
		if err != nil {
			// Handle the error
			return false, 0, 0, 0
		}

		height := config.Height
		width := config.Width

		// img, _, err := image.Decode(file)
		// if err != nil {
		// 	// Handle the error
		// 	return false, 0, 0, 0
		// }

		// // Get the image bounds and dimensions
		// bounds := img.Bounds()
		// height := bounds.Max.Y - bounds.Min.Y
		// width := bounds.Max.X - bounds.Min.X

		// Determine the orientation based on the aspect ratio
		// 0: square, 1: portrait, 2: landscape
		var orientation byte
		orientation = 0
		if height > width {
			orientation = 1
		} else if width > height {
			orientation = 2
		}

		// Return true and the image properties
		return true, height, width, orientation
	} else {
		// Return false and zero values
		return false, 0, 0, 0
	}
}

func thumbnailHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	basePath := r.URL.Query().Get("basePath")
	if path == "" || basePath == "" {
		http.Error(w, "Missing path/basePath parameter", http.StatusBadRequest)
		return
	}

	fmt.Printf("THUMBNAIL: %v + %v\n", basePath, path)
	fmt.Println(filepath.Join(basePath, path))

	img, err := imaging.Open(filepath.Join(basePath, path))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	thumbnail := imaging.Thumbnail(img, 100, 100, imaging.Lanczos) // 0 was 300
	ext := strings.ToLower(filepath.Ext(path))
	fmt.Printf("ext: %v", ext)

	// Set the appropriate content type based on the file extension
	switch ext {
	case ".jpg", ".jpeg":
		w.Header().Set("Content-Type", "image/jpeg")
	case ".png":
		w.Header().Set("Content-Type", "image/png")
	default:
		http.Error(w, "Unsupported file type", http.StatusBadRequest)
		return
	}

	err = imaging.Encode(w, thumbnail, imaging.JPEG)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//thumbnailPath := strings.TrimSuffix(path, ext) + "_thumbnail" + ext
	// err = imaging.Save(thumbnail, thumbnailPath)
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }
	// http.ServeFile(w, r, thumbnailPath)

}
