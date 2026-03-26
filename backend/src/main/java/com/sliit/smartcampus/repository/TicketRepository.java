package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByCreatedByUserId(String userId);
    List<Ticket> findByAssignedTechnicianId(String technicianId);
}
