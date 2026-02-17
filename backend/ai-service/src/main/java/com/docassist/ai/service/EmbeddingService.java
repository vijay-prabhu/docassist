package com.docassist.ai.service;

import com.docassist.ai.entity.ChunkEmbedding;
import com.docassist.ai.repository.ChunkEmbeddingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;
    private final ChunkEmbeddingRepository embeddingRepository;

    @Transactional
    public void embedAndStoreChunks(List<ChunkData> chunks, UUID documentId, UUID userId) {
        log.info("Embedding {} chunks for document {}", chunks.size(), documentId);

        for (ChunkData chunk : chunks) {
            float[] vector = embeddingModel.embed(chunk.content());
            String vectorString = toVectorString(vector);

            ChunkEmbedding embedding = ChunkEmbedding.builder()
                    .chunkId(chunk.chunkId())
                    .documentId(documentId)
                    .userId(userId)
                    .content(chunk.content())
                    .embedding(vectorString)
                    .build();

            embeddingRepository.save(embedding);
        }

        log.info("Stored {} embeddings for document {}", chunks.size(), documentId);
    }

    public List<ChunkEmbedding> searchSimilar(String query, UUID userId, UUID documentId, int topK) {
        float[] queryVector = embeddingModel.embed(query);
        String vectorString = toVectorString(queryVector);

        return embeddingRepository.findSimilarChunks(userId, documentId, vectorString, topK);
    }

    @Transactional
    public void deleteByDocumentId(UUID documentId) {
        embeddingRepository.deleteByDocumentId(documentId);
    }

    private String toVectorString(float[] vector) {
        return "[" + Arrays.stream(toDoubleArray(vector))
                .mapToObj(String::valueOf)
                .collect(Collectors.joining(",")) + "]";
    }

    private double[] toDoubleArray(float[] floats) {
        double[] doubles = new double[floats.length];
        for (int i = 0; i < floats.length; i++) {
            doubles[i] = floats[i];
        }
        return doubles;
    }

    public record ChunkData(UUID chunkId, String content) {}
}
