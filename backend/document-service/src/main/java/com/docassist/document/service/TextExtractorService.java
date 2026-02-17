package com.docassist.document.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

@Service
@Slf4j
public class TextExtractorService {

    private final Tika tika = new Tika();

    public String extractText(InputStream inputStream, String contentType) {
        try {
            String text = tika.parseToString(inputStream);
            log.info("Extracted {} characters from document (type: {})", text.length(), contentType);
            return text;
        } catch (IOException | TikaException e) {
            log.error("Failed to extract text from document", e);
            throw new RuntimeException("Failed to extract text from document: " + e.getMessage(), e);
        }
    }
}
