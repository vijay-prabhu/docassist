package com.docassist.ai.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SourceChunk implements Serializable {
    private UUID chunkId;
    private UUID documentId;
    private String content;
    private double score;
}
