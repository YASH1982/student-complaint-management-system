package com.yash.complaint_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yash.complaint_management.dto.ComplaintRequest;
import com.yash.complaint_management.dto.ComplaintResponse;
import com.yash.complaint_management.dto.ComplaintStatusHistoryResponse;
import com.yash.complaint_management.dto.StudentComplaintCommentRequest;
import com.yash.complaint_management.entity.User;
import com.yash.complaint_management.repository.UserRepository;
import com.yash.complaint_management.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    // Create complaint
    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        ComplaintResponse response =
                complaintService.createComplaint(request, user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get all complaints of logged-in student
    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getStudentComplaints(
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        List<ComplaintResponse> complaints =
                complaintService.getStudentComplaints(user.getId());

        return ResponseEntity.ok(complaints);
    }

    // Get one complaint
    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getStudentComplaint(
            @PathVariable Long id,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        ComplaintResponse response =
                complaintService.getStudentComplaint(
                        id,
                        user.getId()
                );

        return ResponseEntity.ok(response);
    }

    // Get complaint status history
@GetMapping("/{id}/history")
public ResponseEntity<List<ComplaintStatusHistoryResponse>> getStudentComplaintHistory(
        @PathVariable Long id,
        Authentication authentication) {

    User user = getLoggedInUser(authentication);

    List<ComplaintStatusHistoryResponse> history =
            complaintService.getStudentComplaintHistory(
                    id,
                    user.getId()
            );

    return ResponseEntity.ok(history);
}


// Add comment to student's complaint
@PostMapping("/{id}/comments")
public ResponseEntity<ComplaintStatusHistoryResponse> addComment(
        @PathVariable Long id,
        @Valid @RequestBody StudentComplaintCommentRequest request,
        Authentication authentication) {

    User user = getLoggedInUser(authentication);

    ComplaintStatusHistoryResponse response =
            complaintService.addStudentComplaintComment(
                    id,
                    user.getId(),
                    request.getComment()
            );

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
}
    // Edit complaint
    @PutMapping("/{id}")
    public ResponseEntity<ComplaintResponse> updateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        ComplaintResponse response =
                complaintService.updateComplaint(
                        id,
                        request,
                        user.getId()
                );

        return ResponseEntity.ok(response);
    }

    // Cancel complaint
    @DeleteMapping("/{id}")
    public ResponseEntity<ComplaintResponse> cancelComplaint(
            @PathVariable Long id,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);

        ComplaintResponse response =
                complaintService.cancelComplaint(
                        id,
                        user.getId()
                );

        return ResponseEntity.ok(response);
    }

    // Get logged-in user
    private User getLoggedInUser(
            Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }
}