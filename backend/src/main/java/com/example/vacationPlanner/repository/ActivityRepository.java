package com.example.vacationPlanner.repository;

import com.example.vacationPlanner.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByItineraryId(Long itineraryId);
    List<Activity> findByItineraryIdAndDateOrderByStartTime(Long itineraryId, LocalDate date);
    void deleteByItineraryId(Long itineraryId);
}
