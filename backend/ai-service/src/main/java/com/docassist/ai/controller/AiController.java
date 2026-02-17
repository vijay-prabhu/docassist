package com.docassist.ai.controller;

import com.docassist.ai.dto.*;
import com.docassist.ai.service.ChatService;
import com.docassist.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI-powered document Q&A and chat")
public class AiController {

    private final ChatService chatService;

    @PostMapping("/chat")
    @Operation(summary = "Ask a question about your documents")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @Valid @RequestBody ChatRequest request,
            @RequestHeader("X-User-Id") String userId) {
        ChatResponse response = chatService.chat(request, UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/sessions")
    @Operation(summary = "List chat sessions")
    public ResponseEntity<ApiResponse<List<ChatSessionResponse>>> getSessions(
            @RequestHeader("X-User-Id") String userId) {
        List<ChatSessionResponse> sessions = chatService.getUserSessions(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Get chat session messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getSession(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        List<ChatMessageResponse> messages = chatService.getSessionMessages(id, UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @DeleteMapping("/sessions/{id}")
    @Operation(summary = "Delete a chat session")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") String userId) {
        chatService.deleteSession(id, UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success("Session deleted", null));
    }
}
