package com.yash.complaint_management.dto;

import java.time.LocalDateTime;

import com.yash.complaint_management.enums.ComplaintCategory;
import com.yash.complaint_management.enums.ComplaintPriority;
import com.yash.complaint_management.enums.ComplaintStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ComplaintResponse {

    private Long id;

    private String trackingNumber;

    private String title;

    private String description;

    private ComplaintCategory category;

    private ComplaintPriority priority;

    private ComplaintStatus status;

    private String resolution;

    private Long departmentId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;
}