package com.example.GalleryApp.controller;

import com.example.GalleryApp.exception.DuplicateImageException;
import com.example.GalleryApp.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    @Autowired
    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    // Endpoint to upload an image
    @CrossOrigin(origins = "*")
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file, @RequestParam("userId") Long userId) {
        try {
            String imageUrl = imageService.uploadImage(file, userId);
            return new ResponseEntity<>(imageUrl, HttpStatus.OK);
        } catch (DuplicateImageException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IOException e) {
            return new ResponseEntity<>("Image upload failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Endpoint to list images for a user
    @CrossOrigin(origins = "*")
    @GetMapping("/list")
    public ResponseEntity<List<String>> listImages(@RequestParam("userId") Long userId) {
        List<String> imageUrls = imageService.listImages(userId);
        return new ResponseEntity<>(imageUrls, HttpStatus.OK);
    }
}
