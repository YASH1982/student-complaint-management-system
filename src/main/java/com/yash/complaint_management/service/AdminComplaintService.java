package com.yash.complaint_management.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.yash.complaint_management.dto.AdminComplaintUpdateRequest;
import com.yash.complaint_management.dto.ComplaintResponse;
import com.yash.complaint_management.dto.ComplaintStatusHistoryResponse;
import com.yash.complaint_management.entity.Complaint;
import com.yash.complaint_management.entity.ComplaintStatusHistory;
import com.yash.complaint_management.entity.Department;
import com.yash.complaint_management.entity.User;
import com.yash.complaint_management.enums.ComplaintCategory;
import com.yash.complaint_management.enums.ComplaintPriority;
import com.yash.complaint_management.enums.ComplaintStatus;
import com.yash.complaint_management.exception.ComplaintNotFoundException;
import com.yash.complaint_management.exception.DepartmentNotFoundException;
import com.yash.complaint_management.repository.ComplaintRepository;
import com.yash.complaint_management.repository.ComplaintSpecification;
import com.yash.complaint_management.repository.ComplaintStatusHistoryRepository;
import com.yash.complaint_management.repository.DepartmentRepository;
import com.yash.complaint_management.repository.UserRepository;
import com.yash.complaint_management.dto.AdminComplaintStatisticsResponse;
import com.yash.complaint_management.dto.AdminComplaintDetailsResponse;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminComplaintService {

    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;

    // Get complaints with filters, search, pagination and sorting
    public Page<ComplaintResponse> getAllComplaints(
            ComplaintStatus status,
            ComplaintCategory category,
            ComplaintPriority priority,
            Long departmentId,
            String studentName,
            String studentEmail,
            Pageable pageable) {

      Specification<Complaint> specification =
        Specification
                .where(ComplaintSpecification.hasStatus(status))
                .and(ComplaintSpecification.hasCategory(category))
                .and(ComplaintSpecification.hasPriority(priority))
                .and(ComplaintSpecification.hasDepartmentId(departmentId))
                .and(ComplaintSpecification.hasStudentSearch(studentName));

        return complaintRepository
                .findAll(specification, pageable)
                .map(this::mapToResponse);
    }

    // Get complaint statistics for admin dashboard
public AdminComplaintStatisticsResponse getStatistics() {

    long submitted =
            complaintRepository.countByStatus(
                    ComplaintStatus.SUBMITTED);

    long assigned =
            complaintRepository.countByStatus(
                    ComplaintStatus.ASSIGNED);

    long inProgress =
            complaintRepository.countByStatus(
                    ComplaintStatus.IN_PROGRESS);

    long resolved =
            complaintRepository.countByStatus(
                    ComplaintStatus.RESOLVED);

    long closed =
            complaintRepository.countByStatus(
                    ComplaintStatus.CLOSED);

    long rejected =
            complaintRepository.countByStatus(
                    ComplaintStatus.REJECTED);

    long cancelled =
            complaintRepository.countByStatus(
                    ComplaintStatus.CANCELLED);

    long total =
            submitted
            + assigned
            + inProgress
            + resolved
            + closed
            + rejected
            + cancelled;

    return new AdminComplaintStatisticsResponse(
            total,
            submitted,
            assigned,
            inProgress,
            resolved,
            closed,
            rejected,
            cancelled
    );
}

    // Get one complaint by ID
    public ComplaintResponse getComplaintById(Long complaintId) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new ComplaintNotFoundException(
                                "Complaint not found with id: " + complaintId));

        return mapToResponse(complaint);
    }


// Get complete complaint details for admin
@Transactional(readOnly = true)
public AdminComplaintDetailsResponse getComplaintDetails(
        Long complaintId) {

    Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() ->
                    new ComplaintNotFoundException(
                            "Complaint not found with id: " + complaintId));

    return new AdminComplaintDetailsResponse(
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
            complaint.getResolvedAt(),
            complaint.getUser() != null
                    ? complaint.getUser().getName()
                    : null,
            complaint.getUser() != null
                    ? complaint.getUser().getEmail()
                    : null
    );
}

    // Assign department to complaint
    public ComplaintResponse assignDepartment(
            Long complaintId,
            Long departmentId) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new ComplaintNotFoundException(
                                "Complaint not found with id: " + complaintId));

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new DepartmentNotFoundException(
                                "Department not found with id: " + departmentId));

        complaint.setDepartment(department);

        Complaint savedComplaint =
                complaintRepository.save(complaint);

        return mapToResponse(savedComplaint);
    }

    // Update complaint status and add comment to status history
   public ComplaintResponse updateStatus(
        Long complaintId,
        AdminComplaintUpdateRequest request,
        String adminEmail) {

    Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() ->
                    new ComplaintNotFoundException(
                            "Complaint not found with id: " + complaintId));

    ComplaintStatus oldStatus = complaint.getStatus();
    ComplaintStatus newStatus = request.getStatus();

    if (newStatus == null) {
        throw new IllegalArgumentException(
                "Status is required");
    }

    // Validate status transition
    if (!isValidStatusTransition(oldStatus, newStatus)) {
        throw new IllegalStateException(
                "Invalid status transition from "
                        + oldStatus
                        + " to "
                        + newStatus);
    }

    User admin = userRepository.findByEmail(adminEmail)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Admin user not found"));

    // Handle resolution rules
    if (newStatus == ComplaintStatus.RESOLVED) {

        if (request.getResolution() == null ||
                request.getResolution().isBlank()) {

            throw new IllegalArgumentException(
                    "Resolution is required when complaint is resolved");
        }

        complaint.setStatus(newStatus);
        complaint.setResolution(request.getResolution());
        complaint.setResolvedAt(LocalDateTime.now());

    } else if (newStatus == ComplaintStatus.CLOSED) {

        if (complaint.getResolution() == null ||
                complaint.getResolution().isBlank()) {

            throw new IllegalStateException(
                    "Complaint must be resolved before it can be closed");
        }

        complaint.setStatus(newStatus);

    } else {

        complaint.setStatus(newStatus);
    }

    Complaint savedComplaint =
            complaintRepository.save(complaint);

    // Create status history and save admin comment
    ComplaintStatusHistory history =
            ComplaintStatusHistory.builder()
                    .complaint(savedComplaint)
                    .oldStatus(oldStatus)
                    .newStatus(newStatus)
                    .changedBy(admin)
                    .comment(request.getComment())
                    .changedAt(LocalDateTime.now())
                    .build();

    statusHistoryRepository.save(history);

    return mapToResponse(savedComplaint);
}

    // Get complaint status history and comments
  public List<ComplaintStatusHistoryResponse> getComplaintHistory(Long complaintId) {
    if (!complaintRepository.existsById(complaintId)) {
        throw new ComplaintNotFoundException("Complaint not found with id: " + complaintId);
    }

    return statusHistoryRepository.findByComplaintIdOrderByChangedAtAsc(complaintId).stream()
            .map(history -> new ComplaintStatusHistoryResponse(
                    history.getId(),
                    history.getOldStatus(),
                    history.getNewStatus(),
                    history.getChangedBy() != null ? history.getChangedBy().getName() : null,
                    history.getComment(),
                    history.getChangedAt()))
            .toList();
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

    // Validate complaint status transition
private boolean isValidStatusTransition(
        ComplaintStatus oldStatus,
        ComplaintStatus newStatus) {

    if (oldStatus == newStatus) {
        return true;
    }

    return switch (oldStatus) {

        case SUBMITTED ->
                newStatus == ComplaintStatus.ASSIGNED
                        || newStatus == ComplaintStatus.REJECTED
                        || newStatus == ComplaintStatus.CANCELLED;

        case ASSIGNED ->
                newStatus == ComplaintStatus.IN_PROGRESS
                        || newStatus == ComplaintStatus.REJECTED;

        case IN_PROGRESS ->
                newStatus == ComplaintStatus.RESOLVED;

        case RESOLVED ->
                newStatus == ComplaintStatus.CLOSED;

        case CLOSED, REJECTED, CANCELLED ->
                false;
    };
}
}