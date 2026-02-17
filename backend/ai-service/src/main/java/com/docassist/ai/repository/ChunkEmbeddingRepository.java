package com.docassist.ai.repository;

import com.docassist.ai.entity.ChunkEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChunkEmbeddingRepository extends JpaRepository<ChunkEmbedding, UUID> {

    @Query(value = """
            SELECT * FROM ai_db.chunk_embeddings
            WHERE user_id = :userId
            AND document_id = COALESCE(:documentId, document_id)
            ORDER BY embedding <=> cast(:queryEmbedding as vector)
            LIMIT :topK
            """, nativeQuery = true)
    List<ChunkEmbedding> findSimilarChunks(
            @Param("userId") UUID userId,
            @Param("documentId") UUID documentId,
            @Param("queryEmbedding") String queryEmbedding,
            @Param("topK") int topK);

    void deleteByDocumentId(UUID documentId);

    List<ChunkEmbedding> findByDocumentId(UUID documentId);
}
