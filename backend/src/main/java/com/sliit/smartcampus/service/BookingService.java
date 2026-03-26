package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.booking.BookingCreateRequest;
import com.sliit.smartcampus.dto.booking.BookingDecisionRequest;
import com.sliit.smartcampus.dto.booking.BookingResponse;

import java.util.List;

public interface BookingService {
    BookingResponse create(BookingCreateRequest request);
    List<BookingResponse> getMyBookings();
    List<BookingResponse> getAll();
    BookingResponse getById(String id);
    BookingResponse approve(String id, BookingDecisionRequest request);
    BookingResponse reject(String id, BookingDecisionRequest request);
    BookingResponse cancel(String id);
}
