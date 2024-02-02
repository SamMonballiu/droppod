package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"encoding/json"
)

type FilesResponse struct {
	IsSuccess bool                   `json:"isSuccess"`
	Error     string                 `json:"error"`
	Response  *FilesResponseContents `json:"response"`
}

type FilesResponseContents struct {
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
	fmt.Println("Listening on port 5566...")
	http.ListenAndServe(":5566", nil)
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	basePath := r.URL.Query().Get("basePath")
	fullPath := filepath.Join(basePath, path)
	if path == "" || basePath == "" {
		http.Error(w, "Missing path/basePath parameter", http.StatusBadRequest)
		return
	}

	files, err := os.ReadDir(fullPath)
	if err != nil {
		fmt.Println(err.Error())
		response := FilesResponse{
			IsSuccess: false,
			Error:     err.Error(),
		}
		jsonBytes, _ := json.MarshalIndent(response, "", "")
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonBytes)
		return
	}

	var folderInfo FolderInfo
	subFolders := []FolderInfo{}
	subFiles := []FileInfo{}
	folderInfo = FolderInfo{Name: path, Parent: filepath.Dir(path)[1:], Files: subFiles, Folders: subFolders}

	for _, file := range files {
		if file.IsDir() {
			folderInfo := FolderInfo{
				Name:      file.Name(),
				Parent:    path[1:],
				Files:     []FileInfo{},
				Folders:   []FolderInfo{},
				DateAdded: time.Now(),
			}
			subFolders = append(subFolders, folderInfo)
		} else {
			info, _ := file.Info()
			filename := file.Name()

			fileInfo := FileInfo{
				Filename:     filename,
				FullPath:     filepath.Join(path, filename),
				RelativePath: path,
				Extension:    filepath.Ext(filename),
				Size:         info.Size(),
				DateAdded:    info.ModTime(),
				Rating:       0,
			}

			subFiles = append(subFiles, fileInfo)
		}
	}
	folderInfo.Files = subFiles
	folderInfo.Folders = subFolders

	response := FilesResponse{
		IsSuccess: true,
		Error:     "",
		Response: &FilesResponseContents{
			Freespace: 0,
			Contents:  folderInfo,
		},
	}
	jsonBytes, _ := json.MarshalIndent(response, "", "")
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonBytes)
}
