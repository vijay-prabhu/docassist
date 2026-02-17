package com.docassist.ai.dto;

import com.docassist.ai.entity.MessageRole;
import com.docassist.ai.entity.SourceChunk;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private UUID id;
    private MessageRole role;
    private String content;
    private List<SourceChunk> sourceChunks;
    private LocalDateTime createdAt;
}
