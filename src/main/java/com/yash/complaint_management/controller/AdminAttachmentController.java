package com.yash.complaint_management.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yash.complaint_management.dto.AttachmentResponse;
import com.yash.complaint_management.entity.ComplaintAttachment;
import com.yash.complaint_management.repository.ComplaintAttachmentRepository;
import com.yash.complaint_management.service.AttachmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/complaints")
@RequiredArgsConstructor
public class AdminAttachmentController {

    private final AttachmentService attachmentService;
    private final ComplaintAttachmentRepository attachmentRepository;

    // Get complaint attachments
    @GetMapping("/{complaintId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(
            @PathVariable Long complaintId) {

        return ResponseEntity.ok(
                attachmentService.getAttachmentsForAdmin(
                        complaintId
                )
        );
    }

    // View / download attachment
    @GetMapping("/attachments/{attachmentId}/file")
    public ResponseEntity<Resource> getAttachmentFile(
            @PathVariable Long attachmentId) {

        Resource resource =
                attachmentService.getAttachmentFileForAdmin(
                        attachmentId
                );

        ComplaintAttachment attachment =
                attachmentRepository.findById(attachmentId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Attachment not found"));

        MediaType mediaType;

        try {
            mediaType = MediaType.parseMediaType(
                    attachment.getContentType()
            );
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" +
                                attachment.getFileName() +
                                "\""
                )
                .body(resource);
    }
}