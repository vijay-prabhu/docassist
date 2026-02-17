package com.docassist.ai.service;

import com.docassist.ai.dto.*;
import com.docassist.ai.entity.*;
import com.docassist.ai.repository.ChatMessageRepository;
import com.docassist.ai.repository.ChatSessionRepository;
import com.docassist.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final RagService ragService;

    @Transactional
    public ChatResponse chat(ChatRequest request, UUID userId) {
        ChatSession session;

        if (request.getSessionId() != null) {
            session = sessionRepository.findByIdAndUserId(request.getSessionId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", request.getSessionId()));
        } else {
            session = ChatSession.builder()
                    .userId(userId)
                    .documentId(request.getDocumentId())
                    .title(request.getQuestion().substring(0, Math.min(100, request.getQuestion().length())))
                    .build();
            session = sessionRepository.save(session);
        }

        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .role(MessageRole.USER)
                .content(request.getQuestion())
                .build();
        messageRepository.save(userMessage);

        RagService.RagResult result = ragService.answerQuestion(
                request.getQuestion(), userId, request.getDocumentId());

        ChatMessage assistantMessage = ChatMessage.builder()
                .session(session)
                .role(MessageRole.ASSISTANT)
                .content(result.answer())
                .sourceChunks(result.sources())
                .build();
        messageRepository.save(assistantMessage);

        return ChatResponse.builder()
                .sessionId(session.getId())
                .answer(result.answer())
                .sources(result.sources())
                .build();
    }

    public List<ChatSessionResponse> getUserSessions(UUID userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toSessionResponse)
                .toList();
    }

    public List<ChatMessageResponse> getSessionMessages(UUID sessionId, UUID userId) {
        ChatSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", sessionId));

        return messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId())
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public void deleteSession(UUID sessionId, UUID userId) {
        ChatSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", "id", sessionId));
        sessionRepository.delete(session);
    }

    private ChatSessionResponse toSessionResponse(ChatSession session) {
        return ChatSessionResponse.builder()
                .id(session.getId())
                .documentId(session.getDocumentId())
                .title(session.getTitle())
                .messageCount(session.getMessages().size())
                .createdAt(session.getCreatedAt())
                .build();
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .sourceChunks(message.getSourceChunks())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
