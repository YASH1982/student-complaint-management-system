package com.yash.complaint_management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminComplaintStatisticsResponse {

    private long total;
    private long submitted;
    private long assigned;
    private long inProgress;
    private long resolved;
    private long closed;
    private long rejected;
    private long cancelled;
}