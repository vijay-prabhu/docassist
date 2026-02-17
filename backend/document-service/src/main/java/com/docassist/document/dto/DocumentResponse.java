package com.docassist.document.dto;

import com.docassist.document.entity.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private UUID id;
    private String filename;
    private String contentType;
    private Long fileSize;
    private DocumentStatus status;
    private Integer pageCount;
    private int chunkCount;
    private LocalDateTime createdAt;
}
