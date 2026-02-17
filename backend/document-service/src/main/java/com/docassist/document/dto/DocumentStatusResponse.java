package com.docassist.document.dto;

import com.docassist.document.entity.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentStatusResponse {
    private UUID id;
    private DocumentStatus status;
    private int chunkCount;
}
