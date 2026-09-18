package com.yash.complaint_management.repository;

import org.springframework.data.jpa.domain.Specification;

import com.yash.complaint_management.entity.Complaint;
import com.yash.complaint_management.enums.ComplaintCategory;
import com.yash.complaint_management.enums.ComplaintPriority;
import com.yash.complaint_management.enums.ComplaintStatus;

public class ComplaintSpecification {

    private ComplaintSpecification() {
    }

    public static Specification<Complaint> hasStatus(
            ComplaintStatus status) {

        return (root, query, criteriaBuilder) ->
                status == null
                        ? null
                        : criteriaBuilder.equal(
                                root.get("status"),
                                status
                        );
    }

    public static Specification<Complaint> hasCategory(
            ComplaintCategory category) {

        return (root, query, criteriaBuilder) ->
                category == null
                        ? null
                        : criteriaBuilder.equal(
                                root.get("category"),
                                category
                        );
    }

    public static Specification<Complaint> hasPriority(
            ComplaintPriority priority) {

        return (root, query, criteriaBuilder) ->
                priority == null
                        ? null
                        : criteriaBuilder.equal(
                                root.get("priority"),
                                priority
                        );
    }

    public static Specification<Complaint> hasDepartmentId(
            Long departmentId) {

        return (root, query, criteriaBuilder) ->
                departmentId == null
                        ? null
                        : criteriaBuilder.equal(
                                root.get("department").get("id"),
                                departmentId
                        );
    }

    // Search by student name OR email
    public static Specification<Complaint> hasStudentSearch(
            String search) {

        return (root, query, criteriaBuilder) -> {

            if (search == null || search.isBlank()) {
                return null;
            }

            String searchPattern =
                    "%" + search.trim().toLowerCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("user").get("name")
                            ),
                            searchPattern
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("user").get("email")
                            ),
                            searchPattern
                    )
            );
        };
    }
}