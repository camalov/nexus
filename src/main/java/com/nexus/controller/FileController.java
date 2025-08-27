package com.nexus.controller;

import com.nexus.model.dto.FileUploadResponse;
import com.nexus.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String filename = fileStorageService.store(file);
            String fileDownloadUri = "/media/" + filename;

            return ResponseEntity.ok(new FileUploadResponse(fileDownloadUri));
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}
