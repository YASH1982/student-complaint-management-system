package com.yash.complaint_management.exception;

public class UnauthorizedComplaintAccessException extends RuntimeException {

    public UnauthorizedComplaintAccessException(String message) {
        super(message);
    }
}