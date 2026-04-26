package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.booking.BookingCreateRequest;
import com.sliit.smartcampus.dto.booking.BookingDecisionRequest;
import com.sliit.smartcampus.dto.booking.BookingResponse;

import java.util.List;

public interface BookingService {
    BookingResponse create(BookingCreateRequest request);
    List<BookingResponse> getMyBookings();
    List<BookingResponse> getAll(String status, String resourceId, String userId, String dateFrom, String dateTo);
    BookingResponse getById(String id);
    BookingResponse approve(String id, BookingDecisionRequest request);
    BookingResponse reject(String id, BookingDecisionRequest request);
    BookingResponse cancel(String id);
    BookingResponse update(String id, BookingCreateRequest request);
    void delete(String id);
}
