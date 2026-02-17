package com.docassist.document.service;

import com.docassist.document.dto.DocumentResponse;
import com.docassist.document.entity.Document;
import com.docassist.document.entity.DocumentStatus;
import com.docassist.document.repository.DocumentChunkRepository;
import com.docassist.document.repository.DocumentRepository;
import com.docassist.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentChunkRepository chunkRepository;
    @Mock private FileStorageService fileStorageService;
    @Mock private TextExtractorService textExtractorService;
    @Mock private TextChunkingService textChunkingService;

    @InjectMocks
    private DocumentService documentService;

    private UUID userId;
    private UUID documentId;
    private Document testDocument;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        documentId = UUID.randomUUID();
        testDocument = Document.builder()
                .id(documentId)
                .userId(userId)
                .filename("test.pdf")
                .contentType("application/pdf")
                .fileSize(1024L)
                .status(DocumentStatus.READY)
                .chunks(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void uploadDocument_Success() {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf",
                "application/pdf", "test content".getBytes());

        when(documentRepository.save(any(Document.class))).thenReturn(testDocument);
        when(fileStorageService.store(any(), any())).thenReturn(Path.of("/tmp/test.pdf"));

        DocumentResponse response = documentService.uploadDocument(file, userId);

        assertThat(response.getFilename()).isEqualTo("test.pdf");
        verify(documentRepository, times(2)).save(any(Document.class));
    }

    @Test
    void getUserDocuments_ReturnsList() {
        when(documentRepository.findByUserIdOrderByCreatedAtDesc(userId))
                .thenReturn(List.of(testDocument));

        List<DocumentResponse> docs = documentService.getUserDocuments(userId);

        assertThat(docs).hasSize(1);
        assertThat(docs.get(0).getFilename()).isEqualTo("test.pdf");
    }

    @Test
    void getDocument_Found() {
        when(documentRepository.findByIdAndUserId(documentId, userId))
                .thenReturn(Optional.of(testDocument));

        DocumentResponse response = documentService.getDocument(documentId, userId);
        assertThat(response.getId()).isEqualTo(documentId);
    }

    @Test
    void getDocument_NotFound() {
        when(documentRepository.findByIdAndUserId(documentId, userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.getDocument(documentId, userId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteDocument_Success() {
        when(documentRepository.findByIdAndUserId(documentId, userId))
                .thenReturn(Optional.of(testDocument));

        documentService.deleteDocument(documentId, userId);

        verify(documentRepository).delete(testDocument);
    }
}
