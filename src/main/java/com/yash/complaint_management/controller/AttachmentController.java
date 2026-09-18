package com.yash.complaint_management.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.yash.complaint_management.dto.AttachmentResponse;
import com.yash.complaint_management.entity.ComplaintAttachment;
import com.yash.complaint_management.entity.User;
import com.yash.complaint_management.repository.ComplaintAttachmentRepository;
import com.yash.complaint_management.repository.UserRepository;
import com.yash.complaint_management.service.AttachmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/complaints")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final UserRepository userRepository;
    private final ComplaintAttachmentRepository attachmentRepository;

    // Upload attachment
    @PostMapping(
            value = "/{complaintId}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable Long complaintId,
            @RequestPart("file") MultipartFile file,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        AttachmentResponse response =
                attachmentService.uploadAttachment(
                        complaintId,
                        file,
                        user
                );

        return ResponseEntity.ok(response);
    }

    // Get complaint attachments
    @GetMapping("/{complaintId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(
            @PathVariable Long complaintId,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        return ResponseEntity.ok(
                attachmentService.getAttachments(
                        complaintId,
                        user
                )
        );
    }

    // View / preview attachment
    @GetMapping("/attachments/{attachmentId}/file")
    public ResponseEntity<Resource> getAttachmentFile(
            @PathVariable Long attachmentId,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Resource resource =
                attachmentService.getAttachmentFile(
                        attachmentId,
                        user
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

    // Get logged-in user
    private User getLoggedInUser(
            Authentication authentication) {

        if (authentication == null
                || authentication.getName() == null) {

            throw new IllegalStateException(
                    "User is not authenticated");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));
    }
}