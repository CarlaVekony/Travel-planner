package com.example.vacationPlanner.repository;

import com.example.vacationPlanner.model.Itinerary;
import com.example.vacationPlanner.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByUser(User user);
    List<Itinerary> findByUserId(Long userId);
}
