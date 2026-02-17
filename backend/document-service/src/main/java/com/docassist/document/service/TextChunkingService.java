package com.docassist.document.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class TextChunkingService {

    private final int maxTokens;
    private final int overlapTokens;

    public TextChunkingService(
            @Value("${app.chunking.max-tokens:500}") int maxTokens,
            @Value("${app.chunking.overlap-tokens:50}") int overlapTokens) {
        this.maxTokens = maxTokens;
        this.overlapTokens = overlapTokens;
    }

    public List<String> chunkText(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        String[] words = text.split("\\s+");
        List<String> chunks = new ArrayList<>();

        // Approximate: 1 token ≈ 0.75 words, so maxTokens * 0.75 words per chunk
        int wordsPerChunk = (int) (maxTokens * 0.75);
        int overlapWords = (int) (overlapTokens * 0.75);

        int start = 0;
        while (start < words.length) {
            int end = Math.min(start + wordsPerChunk, words.length);
            StringBuilder chunk = new StringBuilder();
            for (int i = start; i < end; i++) {
                if (i > start) chunk.append(" ");
                chunk.append(words[i]);
            }

            String chunkText = chunk.toString().trim();
            if (!chunkText.isEmpty()) {
                chunks.add(chunkText);
            }

            if (end >= words.length) break;
            start = end - overlapWords;
        }

        log.info("Split text ({} words) into {} chunks (max {} tokens, {} overlap)",
                words.length, chunks.size(), maxTokens, overlapTokens);
        return chunks;
    }

    public int estimateTokenCount(String text) {
        if (text == null || text.isBlank()) return 0;
        return (int) (text.split("\\s+").length / 0.75);
    }
}
