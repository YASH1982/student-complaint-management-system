package com.yash.complaint_management.dto;

import com.yash.complaint_management.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private String token;
    private String message;
}