package com.yash.complaint_management.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttachmentResponse {

    private Long id;

    private String fileName;

    private String contentType;

    private Long fileSize;

    private LocalDateTime uploadedAt;
}