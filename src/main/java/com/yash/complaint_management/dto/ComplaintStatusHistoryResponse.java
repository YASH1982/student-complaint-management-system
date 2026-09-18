package com.yash.complaint_management.dto;

import java.time.LocalDateTime;

import com.yash.complaint_management.enums.ComplaintStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ComplaintStatusHistoryResponse {

    private Long id;

    private ComplaintStatus oldStatus;

    private ComplaintStatus newStatus;

    private String changedBy;

    private String comment;

    private LocalDateTime changedAt;
}