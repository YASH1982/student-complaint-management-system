package com.yash.complaint_management.dto;

import com.yash.complaint_management.enums.ComplaintStatus;

import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminComplaintUpdateRequest {

    private ComplaintStatus status;

    private Long departmentId;

    @Size(max = 5000, message = "Resolution cannot exceed 5000 characters")
    private String resolution;

    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String comment;
}