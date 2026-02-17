package com.docassist.ai.dto;

import com.docassist.ai.entity.SourceChunk;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private UUID sessionId;
    private String answer;
    private List<SourceChunk> sources;
}
