package com.yash.complaint_management.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yash.complaint_management.dto.AdminComplaintUpdateRequest;
import com.yash.complaint_management.dto.ComplaintResponse;
import com.yash.complaint_management.dto.ComplaintStatusHistoryResponse;
import com.yash.complaint_management.enums.ComplaintCategory;
import com.yash.complaint_management.enums.ComplaintPriority;
import com.yash.complaint_management.enums.ComplaintStatus;
import com.yash.complaint_management.service.AdminComplaintService;
import com.yash.complaint_management.dto.AdminComplaintStatisticsResponse;
import com.yash.complaint_management.dto.AdminComplaintDetailsResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/complaints")
@RequiredArgsConstructor
public class AdminComplaintController {

    private final AdminComplaintService adminComplaintService;

  @GetMapping
public ResponseEntity<Page<ComplaintResponse>> getAllComplaints(
        @RequestParam(required = false)
        ComplaintStatus status,

        @RequestParam(required = false)
        ComplaintCategory category,

        @RequestParam(required = false)
        ComplaintPriority priority,

        @RequestParam(required = false)
        Long departmentId,

        @RequestParam(required = false)
        String studentName,

        @RequestParam(required = false)
        String studentEmail,

        Pageable pageable) {

    return ResponseEntity.ok(
            adminComplaintService.getAllComplaints(
                    status,
                    category,
                    priority,
                    departmentId,
                    studentName,
                    studentEmail,
                    pageable
            )
    );
}

// Get dashboard statistics
@GetMapping("/statistics")
public ResponseEntity<AdminComplaintStatisticsResponse> getStatistics() {

    return ResponseEntity.ok(
            adminComplaintService.getStatistics()
    );
}

 // Get complete complaint details for admin
@GetMapping("/{id}")
public ResponseEntity<AdminComplaintDetailsResponse> getComplaintDetails(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            adminComplaintService.getComplaintDetails(id)
    );
}
    // Assign department
    @PutMapping("/{id}/department")
    public ResponseEntity<ComplaintResponse> assignDepartment(
            @PathVariable Long id,
            @RequestBody AdminComplaintUpdateRequest request) {

        ComplaintResponse response =
                adminComplaintService.assignDepartment(
                        id,
                        request.getDepartmentId()
                );

        return ResponseEntity.ok(response);
    }

    // Update status and add comment
    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody AdminComplaintUpdateRequest request,
            Authentication authentication) {

        ComplaintResponse response =
                adminComplaintService.updateStatus(
                        id,
                        request,
                        authentication.getName()
                );

        return ResponseEntity.ok(response);
    }

    // Get complaint status history and comments
  @GetMapping("/{id}/history")
public ResponseEntity<List<ComplaintStatusHistoryResponse>> getComplaintHistory(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            adminComplaintService.getComplaintHistory(id)
    );
}
}