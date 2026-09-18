package com.yash.complaint_management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalComplaints;

    private long submittedComplaints;

    private long assignedComplaints;

    private long inProgressComplaints;

    private long resolvedComplaints;

    private long closedComplaints;

    private long rejectedComplaints;

    private long cancelledComplaints;
}