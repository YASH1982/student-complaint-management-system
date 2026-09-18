package com.yash.complaint_management.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.yash.complaint_management.dto.ComplaintRequest;
import com.yash.complaint_management.dto.ComplaintResponse;
import com.yash.complaint_management.dto.ComplaintStatusHistoryResponse;
import com.yash.complaint_management.entity.Complaint;
import com.yash.complaint_management.entity.ComplaintStatusHistory;
import com.yash.complaint_management.entity.User;
import com.yash.complaint_management.enums.ComplaintStatus;
import com.yash.complaint_management.exception.ComplaintNotFoundException;
import com.yash.complaint_management.exception.UnauthorizedComplaintAccessException;
import com.yash.complaint_management.repository.ComplaintRepository;
import com.yash.complaint_management.repository.ComplaintStatusHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;

    // Create complaint
    public ComplaintResponse createComplaint(
            ComplaintRequest request,
            User user) {

        String trackingNumber = generateTrackingNumber();

        Complaint complaint = Complaint.builder()
                .trackingNumber(trackingNumber)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .user(user)
                .status(ComplaintStatus.SUBMITTED)
                .build();

        Complaint savedComplaint =
                complaintRepository.save(complaint);

        return mapToResponse(savedComplaint);
    }

    // Generate unique complaint tracking number
    private String generateTrackingNumber() {

        String date = LocalDate.now()
                .format(DateTimeFormatter.BASIC_ISO_DATE);

        String uniquePart = UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();

        return "CMP-" + date + "-" + uniquePart;
    }

    // Get all complaints of a student
    public List<ComplaintResponse> getStudentComplaints(Long userId) {

        return complaintRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get one complaint of a student
    public ComplaintResponse getStudentComplaint(
            Long complaintId,
            Long userId) {

        Complaint complaint = complaintRepository
                .findById(complaintId)
                .orElseThrow(() ->
                        new ComplaintNotFoundException(
                                "Complaint not found with id: " + complaintId));

        checkOwnership(complaint, userId);

        return mapToResponse(complaint);
    }

    // Get complaint status history of a student
    public List<ComplaintStatusHistoryResponse> getStudentComplaintHistory(
            Long complaintId,
            Long userId) {

        Complaint complaint = complaintRepository
                .findById(complaintId)
                .orElseThrow(() ->
                        new ComplaintNotFoundException(
                                "Complaint not found with id: " + complaintId));

        checkOwnership(complaint, userId);

        return statusHistoryRepository
                .findByComplaintIdOrderByChangedAtAsc(complaintId)
                .stream()
                .map(history -> new ComplaintStatusHistoryResponse(
                        history.getId(),
                        history.getOldStatus(),
                        history.getNewStatus(),
                        history.getChangedBy() != null
                                ? history.getChangedBy().getName()
                                : null,
                        history.getComment(),
                        history.getChangedAt()
                ))
                .toList();
    }

    // Add a comment to a student's complaint
public ComplaintStatusHistoryResponse addStudentComplaintComment(
        Long complaintId,
        Long userId,
        String comment) {

    Complaint complaint = complaintRepository
            .findById(complaintId)
            .orElseThrow(() ->
                    new ComplaintNotFoundException(
                            "Complaint not found with id: " + complaintId));

    checkOwnership(complaint, userId);

    ComplaintStatusHistory history =
            ComplaintStatusHistory.builder()
                    .complaint(complaint)
                    .oldStatus(complaint.getStatus())
                    .newStatus(complaint.getStatus())
                    .changedBy(complaint.getUser())
                    .comment(comment)
                    .changedAt(LocalDateTime.now())
                    .build();

    ComplaintStatusHistory savedHistory =
            statusHistoryRepository.save(history);

    return new ComplaintStatusHistoryResponse(
        savedHistory.getId(),
        savedHistory.getOldStatus(),
        savedHistory.getNewStatus(),
        complaint.getUser().getName(),
        savedHistory.getComment(),
        savedHistory.getChangedAt()
);
}

    // Edit complaint
    public ComplaintResponse updateComplaint(
            Long complaintId,
            ComplaintRequest request,
            Long userId) {

        Complaint complaint = complaintRepository
                .findById(complaintId)
                .orElseThrow(() ->
                        new ComplaintNotFoundException(
                                "Complaint not found with id: " + complaintId));

        checkOwnership(complaint, userId);

        if (complaint.getStatus() != ComplaintStatus.SUBMITTED) {
            throw new IllegalStateException(
                    "Complaint can only be edited when status is SUBMITTED");
        }

        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory());
        complaint.setPriority(request.getPriority());

        Complaint updatedComplaint =
                complaintRepository.save(complaint);

        return mapToResponse(updatedComplaint);
    }

    // Cancel complaint
    public ComplaintResponse cancelComplaint(
            Long complaintId,
            Long userId) {

        Complaint complaint = complaintRepository
                .findById(complaintId)
                .orElseThrow(() ->
                        new ComplaintNotFoundException(
                                "Complaint not found with id: " + complaintId));

        checkOwnership(complaint, userId);

        if (complaint.getStatus() != ComplaintStatus.SUBMITTED) {
            throw new IllegalStateException(
                    "Complaint can only be cancelled when status is SUBMITTED");
        }

        ComplaintStatus oldStatus = complaint.getStatus();

        complaint.setStatus(ComplaintStatus.CANCELLED);

        Complaint cancelledComplaint =
                complaintRepository.save(complaint);

        // Create status history for cancellation
        ComplaintStatusHistory history =
                ComplaintStatusHistory.builder()
                        .complaint(cancelledComplaint)
                        .oldStatus(oldStatus)
                        .newStatus(ComplaintStatus.CANCELLED)
                        .changedBy(complaint.getUser())
                        .comment("Complaint cancelled by student")
                        .changedAt(LocalDateTime.now())
                        .build();

        statusHistoryRepository.save(history);

        return mapToResponse(cancelledComplaint);
    }

    // Check whether complaint belongs to logged-in student
    private void checkOwnership(
            Complaint complaint,
            Long userId) {

        if (!complaint.getUser().getId().equals(userId)) {
            throw new UnauthorizedComplaintAccessException(
                    "You are not authorized to access this complaint");
        }
    }

    // Convert Complaint entity to response
    private ComplaintResponse mapToResponse(
            Complaint complaint) {

        return new ComplaintResponse(
                complaint.getId(),
                complaint.getTrackingNumber(),
                complaint.getTitle(),
                complaint.getDescription(),
                complaint.getCategory(),
                complaint.getPriority(),
                complaint.getStatus(),
                complaint.getResolution(),
                complaint.getDepartment() != null
                        ? complaint.getDepartment().getId()
                        : null,
                complaint.getCreatedAt(),
                complaint.getUpdatedAt(),
                complaint.getResolvedAt()
        );
    }
}