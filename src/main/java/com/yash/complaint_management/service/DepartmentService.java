package com.yash.complaint_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.yash.complaint_management.dto.DepartmentRequest;
import com.yash.complaint_management.dto.DepartmentResponse;
import com.yash.complaint_management.entity.Department;
import com.yash.complaint_management.exception.DepartmentNotFoundException;
import com.yash.complaint_management.repository.DepartmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    // Create department
    public DepartmentResponse createDepartment(
            DepartmentRequest request) {

        Department department = Department.builder()
                .name(request.getName())
                .build();

        Department savedDepartment =
                departmentRepository.save(department);

        return mapToResponse(savedDepartment);
    }

    // Get all departments
    public List<DepartmentResponse> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get department by ID
    public DepartmentResponse getDepartmentById(
            Long departmentId) {

        Department department =
                departmentRepository.findById(departmentId)
                        .orElseThrow(() ->
                                new DepartmentNotFoundException(
                                        "Department not found with id: "
                                                + departmentId));

        return mapToResponse(department);
    }

    // Update department
    public DepartmentResponse updateDepartment(
            Long departmentId,
            DepartmentRequest request) {

        Department department =
                departmentRepository.findById(departmentId)
                        .orElseThrow(() ->
                                new DepartmentNotFoundException(
                                        "Department not found with id: "
                                                + departmentId));

        department.setName(request.getName());

        Department updatedDepartment =
                departmentRepository.save(department);

        return mapToResponse(updatedDepartment);
    }

    // Delete department
    public void deleteDepartment(Long departmentId) {

        Department department =
                departmentRepository.findById(departmentId)
                        .orElseThrow(() ->
                                new DepartmentNotFoundException(
                                        "Department not found with id: "
                                                + departmentId));

        departmentRepository.delete(department);
    }

    // Convert entity to response
    private DepartmentResponse mapToResponse(
            Department department) {

        return new DepartmentResponse(
                department.getId(),
                department.getName()
        );
    }
}