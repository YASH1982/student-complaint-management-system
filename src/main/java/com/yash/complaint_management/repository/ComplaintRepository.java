package com.yash.complaint_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.yash.complaint_management.entity.Complaint;
import com.yash.complaint_management.enums.ComplaintStatus;

public interface ComplaintRepository
        extends JpaRepository<Complaint, Long>,
                JpaSpecificationExecutor<Complaint> {

    List<Complaint> findByUserId(Long userId);

    List<Complaint> findByStatus(ComplaintStatus status);

    long countByStatus(ComplaintStatus status);

    List<Complaint> findByDepartmentId(Long departmentId);
}