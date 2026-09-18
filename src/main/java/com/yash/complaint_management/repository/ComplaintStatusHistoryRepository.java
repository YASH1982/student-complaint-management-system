package com.yash.complaint_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yash.complaint_management.entity.ComplaintStatusHistory;

public interface ComplaintStatusHistoryRepository
        extends JpaRepository<ComplaintStatusHistory, Long> {

    @Query("""
            SELECT h
            FROM ComplaintStatusHistory h
            JOIN FETCH h.changedBy
            WHERE h.complaint.id = :complaintId
            ORDER BY h.changedAt ASC
            """)
    List<ComplaintStatusHistory> findByComplaintIdOrderByChangedAtAsc(
            @Param("complaintId") Long complaintId);
}