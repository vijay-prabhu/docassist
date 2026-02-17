package com.docassist.document.service;

import com.docassist.common.exception.ResourceNotFoundException;
import com.docassist.document.dto.DocumentResponse;
import com.docassist.document.dto.DocumentStatusResponse;
import com.docassist.document.entity.Document;
import com.docassist.document.entity.DocumentChunk;
import com.docassist.document.entity.DocumentStatus;
import com.docassist.document.repository.DocumentChunkRepository;
import com.docassist.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;
    private final FileStorageService fileStorageService;
    private final TextExtractorService textExtractorService;
    private final TextChunkingService textChunkingService;

    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file, UUID userId) {
        Document document = Document.builder()
                .userId(userId)
                .filename(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .status(DocumentStatus.UPLOADING)
                .build();
        document = documentRepository.save(document);

        Path storedPath = fileStorageService.store(file, document.getId());
        document.setStatus(DocumentStatus.PROCESSING);
        documentRepository.save(document);

        processDocumentAsync(document.getId(), storedPath, file.getContentType());

        return toResponse(document);
    }

    @Async
    public void processDocumentAsync(UUID documentId, Path filePath, String contentType) {
        try {
            Document document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

            InputStream inputStream = fileStorageService.load(filePath);
            String text = textExtractorService.extractText(inputStream, contentType);

            List<String> textChunks = textChunkingService.chunkText(text);

            List<DocumentChunk> chunks = IntStream.range(0, textChunks.size())
                    .mapToObj(i -> DocumentChunk.builder()
                            .document(document)
                            .chunkIndex(i)
                            .content(textChunks.get(i))
                            .tokenCount(textChunkingService.estimateTokenCount(textChunks.get(i)))
                            .build())
                    .toList();

            chunkRepository.saveAll(chunks);

            document.setStatus(DocumentStatus.READY);
            document.setPageCount(estimatePageCount(text));
            documentRepository.save(document);

            log.info("Document {} processed: {} chunks created", documentId, chunks.size());
        } catch (Exception e) {
            log.error("Failed to process document {}", documentId, e);
            documentRepository.findById(documentId).ifPresent(doc -> {
                doc.setStatus(DocumentStatus.FAILED);
                documentRepository.save(doc);
            });
        }
    }

    public List<DocumentResponse> getUserDocuments(UUID userId) {
        return documentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DocumentResponse getDocument(UUID documentId, UUID userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return toResponse(document);
    }

    public DocumentStatusResponse getDocumentStatus(UUID documentId, UUID userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        return DocumentStatusResponse.builder()
                .id(document.getId())
                .status(document.getStatus())
                .chunkCount(document.getChunks().size())
                .build();
    }

    @Transactional
    public void deleteDocument(UUID documentId, UUID userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        documentRepository.delete(document);
    }

    private int estimatePageCount(String text) {
        return Math.max(1, text.length() / 3000);
    }

    private DocumentResponse toResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .filename(document.getFilename())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .status(document.getStatus())
                .pageCount(document.getPageCount())
                .chunkCount(document.getChunks().size())
                .createdAt(document.getCreatedAt())
                .build();
    }
}
