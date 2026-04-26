package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Booking;
import com.sliit.smartcampus.model.enums.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceIdAndBookingDateAndStatusIn(String resourceId, LocalDate bookingDate, Collection<BookingStatus> statuses);
    List<Booking> findByUserIdAndBookingDateAndStatusIn(String userId, LocalDate bookingDate, Collection<BookingStatus> statuses);
}
