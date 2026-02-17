package com.docassist.document.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TextChunkingServiceTest {

    private TextChunkingService chunkingService;

    @BeforeEach
    void setUp() {
        chunkingService = new TextChunkingService(500, 50);
    }

    @Test
    void chunkText_EmptyText_ReturnsEmptyList() {
        assertThat(chunkingService.chunkText("")).isEmpty();
        assertThat(chunkingService.chunkText(null)).isEmpty();
    }

    @Test
    void chunkText_ShortText_ReturnsSingleChunk() {
        String text = "This is a short text that should fit in a single chunk.";
        List<String> chunks = chunkingService.chunkText(text);
        assertThat(chunks).hasSize(1);
        assertThat(chunks.get(0)).isEqualTo(text);
    }

    @Test
    void chunkText_LongText_ReturnsMultipleChunks() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            sb.append("word").append(i).append(" ");
        }
        List<String> chunks = chunkingService.chunkText(sb.toString());
        assertThat(chunks.size()).isGreaterThan(1);
    }

    @Test
    void chunkText_ChunksHaveOverlap() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            sb.append("word").append(i).append(" ");
        }
        List<String> chunks = chunkingService.chunkText(sb.toString());

        // Check that consecutive chunks share some words (overlap)
        if (chunks.size() >= 2) {
            String[] firstChunkWords = chunks.get(0).split("\\s+");
            String[] secondChunkWords = chunks.get(1).split("\\s+");

            // The end of the first chunk should overlap with the beginning of the second
            String lastWordOfFirst = firstChunkWords[firstChunkWords.length - 1];
            boolean hasOverlap = false;
            for (String word : secondChunkWords) {
                if (word.equals(lastWordOfFirst)) {
                    hasOverlap = true;
                    break;
                }
            }
            assertThat(hasOverlap).isTrue();
        }
    }

    @Test
    void estimateTokenCount_ReturnsReasonableEstimate() {
        String text = "one two three four five six seven eight";
        int estimate = chunkingService.estimateTokenCount(text);
        assertThat(estimate).isGreaterThan(0);
        assertThat(estimate).isLessThan(20);
    }
}
