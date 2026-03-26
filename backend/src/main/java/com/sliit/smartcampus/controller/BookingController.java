package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.booking.BookingCreateRequest;
import com.sliit.smartcampus.dto.booking.BookingDecisionRequest;
import com.sliit.smartcampus.dto.booking.BookingResponse;
import com.sliit.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> myBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> all() {
        return ResponseEntity.ok(bookingService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approve(@PathVariable String id, @RequestBody BookingDecisionRequest request) {
        return ResponseEntity.ok(bookingService.approve(id, request));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> reject(@PathVariable String id, @RequestBody BookingDecisionRequest request) {
        return ResponseEntity.ok(bookingService.reject(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.cancel(id));
    }
}
