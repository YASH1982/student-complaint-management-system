package com.yash.complaint_management.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.yash.complaint_management.dto.AttachmentResponse;
import com.yash.complaint_management.entity.Complaint;
import com.yash.complaint_management.entity.ComplaintAttachment;
import com.yash.complaint_management.entity.User;
import com.yash.complaint_management.exception.ComplaintNotFoundException;
import com.yash.complaint_management.exception.UnauthorizedComplaintAccessException;
import com.yash.complaint_management.repository.ComplaintAttachmentRepository;
import com.yash.complaint_management.repository.ComplaintRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private static final String UPLOAD_DIR = "uploads";

    private final ComplaintRepository complaintRepository;
    private final ComplaintAttachmentRepository attachmentRepository;

    // Upload attachment
    @Transactional
    public AttachmentResponse uploadAttachment(
            Long complaintId,
            MultipartFile file,
            User user) {

        Complaint complaint = complaintRepository
                .findById(complaintId)
                .orElseThrow(() ->
                        new ComplaintNotFoundException(
                                "Complaint not found with id: " + complaintId));

        checkOwnership(complaint, user);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Attachment file is required");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR)
                    .toAbsolutePath()
                    .normalize();

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();

            if (originalFileName == null || originalFileName.isBlank()) {
                originalFileName = "attachment";
            }

            String storedFileName =
                    UUID.randomUUID() + "_" + originalFileName;

            Path targetPath = uploadPath
                    .resolve(storedFileName)
                    .normalize();

            if (!targetPath.startsWith(uploadPath)) {
                throw new IllegalArgumentException(
                        "Invalid file name");
            }

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            ComplaintAttachment attachment =
                    ComplaintAttachment.builder()
                            .complaint(complaint)
                            .fileName(originalFileName)
                            .filePath(targetPath.toString())
                            .contentType(
                                    file.getContentType() != null
                                            ? file.getContentType()
                                            : "application/octet-stream")
                            .fileSize(file.getSize())
                            .uploadedAt(LocalDateTime.now())
                            .build();

            ComplaintAttachment savedAttachment =
                    attachmentRepository.save(attachment);

            return mapToResponse(savedAttachment);

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to store attachment", e);
        }
    }

    // Get attachments for student
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachments(
            Long complaintId,
            User user) {

        Complaint complaint = complaintRepository
                .findById(complaintId)
                .orElseThrow(() ->
                        new ComplaintNotFoundException(
                                "Complaint not found with id: " + complaintId));

        checkOwnership(complaint, user);

        return attachmentRepository
                .findByComplaintIdOrderByUploadedAtAsc(complaintId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get attachments for admin
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsForAdmin(
            Long complaintId) {

        if (!complaintRepository.existsById(complaintId)) {
            throw new ComplaintNotFoundException(
                    "Complaint not found with id: " + complaintId);
        }

        return attachmentRepository
                .findByComplaintIdOrderByUploadedAtAsc(complaintId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get attachment file for student
    @Transactional(readOnly = true)
    public Resource getAttachmentFile(
            Long attachmentId,
            User user) {

        ComplaintAttachment attachment =
                getAttachment(attachmentId);

        Complaint complaint = attachment.getComplaint();

        checkOwnership(complaint, user);

        return loadFile(attachment);
    }

    // Get attachment file for admin
    @Transactional(readOnly = true)
    public Resource getAttachmentFileForAdmin(
            Long attachmentId) {

        ComplaintAttachment attachment =
                getAttachment(attachmentId);

        return loadFile(attachment);
    }

    private ComplaintAttachment getAttachment(
            Long attachmentId) {

        return attachmentRepository
                .findById(attachmentId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Attachment not found with id: "
                                        + attachmentId));
    }

    private Resource loadFile(
            ComplaintAttachment attachment) {

        try {
            Path filePath = Paths.get(
                    attachment.getFilePath()
            ).toAbsolutePath().normalize();

            Resource resource =
                    new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalArgumentException(
                        "Attachment file is not available");
            }

            return resource;

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to load attachment file", e);
        }
    }

    private void checkOwnership(
            Complaint complaint,
            User user) {

        if (complaint.getUser() == null
                || !complaint.getUser().getId()
                        .equals(user.getId())) {

            throw new UnauthorizedComplaintAccessException(
                    "You are not authorized to access this complaint");
        }
    }

    private AttachmentResponse mapToResponse(
            ComplaintAttachment attachment) {

        return new AttachmentResponse(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getContentType(),
                attachment.getFileSize(),
                attachment.getUploadedAt()
        );
    }
}