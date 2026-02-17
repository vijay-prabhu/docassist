package com.docassist.document.controller;

import com.docassist.common.dto.ApiResponse;
import com.docassist.document.dto.DocumentResponse;
import com.docassist.document.dto.DocumentStatusResponse;
import com.docassist.document.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document upload, management, and processing")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document")
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-Id") String userId) {
        DocumentResponse response = documentService.uploadDocument(file, UUID.fromString(userId));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document uploaded successfully", response));
    }

    @GetMapping
    @Operation(summary = "List user documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> list(
            @RequestHeader("X-User-Id") String userId) {
        List<DocumentResponse> documents = documentService.getUserDocuments(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document details")
    public ResponseEntity<ApiResponse<DocumentResponse>> get(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        DocumentResponse response = documentService.getDocument(id, UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/status")
    @Operation(summary = "Get document processing status")
    public ResponseEntity<ApiResponse<DocumentStatusResponse>> getStatus(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        DocumentStatusResponse response = documentService.getDocumentStatus(id, UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a document")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        documentService.deleteDocument(id, UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }
}
