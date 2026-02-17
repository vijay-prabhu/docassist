package com.docassist.ai.service;

import com.docassist.ai.entity.ChunkEmbedding;
import com.docassist.ai.entity.SourceChunk;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagService {

    private final EmbeddingService embeddingService;
    private final ChatClient.Builder chatClientBuilder;

    @Value("${app.rag.top-k:5}")
    private int topK;

    public RagResult answerQuestion(String question, UUID userId, UUID documentId) {
        List<ChunkEmbedding> relevantChunks = embeddingService.searchSimilar(
                question, userId, documentId, topK);

        if (relevantChunks.isEmpty()) {
            return new RagResult(
                    "I couldn't find any relevant information in your documents to answer this question.",
                    List.of());
        }

        String context = relevantChunks.stream()
                .map(ChunkEmbedding::getContent)
                .collect(Collectors.joining("\n\n---\n\n"));

        String systemPrompt = """
                You are DocAssist, an AI assistant that answers questions based on document content.
                Use ONLY the provided context to answer the question. If the context doesn't contain
                enough information, say so clearly. Do not make up information.

                Be concise and accurate. Cite which parts of the context support your answer.
                """;

        String userPrompt = String.format("""
                Context from documents:
                %s

                Question: %s

                Answer based on the context above:""", context, question);

        ChatClient chatClient = chatClientBuilder.build();
        String answer = chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();

        List<SourceChunk> sources = relevantChunks.stream()
                .map(chunk -> SourceChunk.builder()
                        .chunkId(chunk.getChunkId())
                        .documentId(chunk.getDocumentId())
                        .content(chunk.getContent().substring(0, Math.min(200, chunk.getContent().length())) + "...")
                        .build())
                .toList();

        return new RagResult(answer, sources);
    }

    public record RagResult(String answer, List<SourceChunk> sources) {}
}
