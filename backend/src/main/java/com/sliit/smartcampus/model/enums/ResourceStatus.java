package com.sliit.smartcampus.model.enums;

public enum ResourceStatus {
    /**
     * Legacy values kept for backward compatibility with existing documents.
     */
    AVAILABLE,
    UNAVAILABLE,

    /**
     * Resource is healthy and can be booked.
     */
    ACTIVE,
    /**
     * Resource is temporarily unavailable (e.g., broken, blocked).
     */
    OUT_OF_SERVICE,
    /**
     * Resource is undergoing planned maintenance.
     */
    MAINTENANCE
}
