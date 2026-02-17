package com.docassist.ai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chunk_embeddings", schema = "ai_db")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChunkEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "chunk_id", nullable = false)
    private UUID chunkId;

    @Column(name = "document_id", nullable = false)
    private UUID documentId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "embedding", columnDefinition = "vector(1536)")
    private String embedding;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
