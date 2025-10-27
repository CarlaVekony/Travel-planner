package com.example.vacationPlanner.controller;

import com.example.vacationPlanner.model.dto.ActivityDTO;
import com.example.vacationPlanner.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:4200")
public class ActivityController {
    
    @Autowired
    private ActivityService activityService;
    
    @GetMapping
    public ResponseEntity<List<ActivityDTO>> getActivities(@RequestParam Long itineraryId) {
        List<ActivityDTO> activities = activityService.getActivitiesByItineraryId(itineraryId);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ActivityDTO> getActivity(@PathVariable Long id) {
        Optional<ActivityDTO> activity = activityService.getActivityById(id);
        return activity.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<ActivityDTO> createActivity(@RequestBody ActivityDTO activityDTO) {
        try {
            ActivityDTO createdActivity = activityService.createActivity(activityDTO);
            return ResponseEntity.ok(createdActivity);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ActivityDTO> updateActivity(@PathVariable Long id, @RequestBody ActivityDTO activityDTO) {
        try {
            ActivityDTO updatedActivity = activityService.updateActivity(id, activityDTO);
            return ResponseEntity.ok(updatedActivity);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        try {
            activityService.deleteActivity(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/budget/total/{itineraryId}")
    public ResponseEntity<BigDecimal> getTotalCost(@PathVariable Long itineraryId) {
        try {
            BigDecimal totalCost = activityService.getTotalCostForItinerary(itineraryId);
            return ResponseEntity.ok(totalCost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/budget/date/{itineraryId}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByDate(@PathVariable Long itineraryId, @RequestParam LocalDate date) {
        try {
            List<ActivityDTO> activities = activityService.getActivitiesByItineraryIdAndDate(itineraryId, date);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
