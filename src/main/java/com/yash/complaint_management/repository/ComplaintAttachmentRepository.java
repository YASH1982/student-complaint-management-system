package com.yash.complaint_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yash.complaint_management.entity.ComplaintAttachment;

public interface ComplaintAttachmentRepository
        extends JpaRepository<ComplaintAttachment, Long> {

    List<ComplaintAttachment> findByComplaintIdOrderByUploadedAtAsc(
            Long complaintId);
}