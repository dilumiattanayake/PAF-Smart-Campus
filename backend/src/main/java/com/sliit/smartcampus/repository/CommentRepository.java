package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
