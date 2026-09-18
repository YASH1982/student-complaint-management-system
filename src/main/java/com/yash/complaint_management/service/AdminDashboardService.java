package com.yash.complaint_management.service;

import org.springframework.stereotype.Service;

import com.yash.complaint_management.dto.AdminDashboardResponse;
import com.yash.complaint_management.enums.ComplaintStatus;
import com.yash.complaint_management.repository.ComplaintRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final ComplaintRepository complaintRepository;

    public AdminDashboardResponse getDashboardStatistics() {

        long total =
                complaintRepository.count();

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

        return new AdminDashboardResponse(
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
}