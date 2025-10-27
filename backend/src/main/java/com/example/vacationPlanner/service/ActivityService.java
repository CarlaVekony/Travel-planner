package com.example.vacationPlanner.service;

import com.example.vacationPlanner.model.Activity;
import com.example.vacationPlanner.model.Itinerary;
import com.example.vacationPlanner.model.dto.ActivityDTO;
import com.example.vacationPlanner.repository.ActivityRepository;
import com.example.vacationPlanner.repository.ItineraryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ActivityService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private ItineraryRepository itineraryRepository;
    
    public List<ActivityDTO> getActivitiesByItineraryId(Long itineraryId) {
        List<Activity> activities = activityRepository.findByItineraryId(itineraryId);
        return activities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<ActivityDTO> getActivityById(Long id) {
        return activityRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    public ActivityDTO createActivity(ActivityDTO activityDTO) {
        Optional<Itinerary> itinerary = itineraryRepository.findById(activityDTO.getItineraryId());
        if (itinerary.isEmpty()) {
            throw new RuntimeException("Itinerary not found");
        }
        
        Activity activity = new Activity();
        activity.setName(activityDTO.getName());
        activity.setLocation(activityDTO.getLocation());
        activity.setStartTime(activityDTO.getStartTime());
        activity.setDuration(activityDTO.getDuration());
        activity.setCost(activityDTO.getCost());
        activity.setDate(activityDTO.getDate());
        activity.setLatitude(activityDTO.getLatitude());
        activity.setLongitude(activityDTO.getLongitude());
        activity.setNotes(activityDTO.getNotes());
        activity.setItinerary(itinerary.get());
        
        Activity savedActivity = activityRepository.save(activity);
        return convertToDTO(savedActivity);
    }
    
    public ActivityDTO updateActivity(Long id, ActivityDTO activityDTO) {
        Optional<Activity> existingActivity = activityRepository.findById(id);
        if (existingActivity.isEmpty()) {
            throw new RuntimeException("Activity not found");
        }
        
        Activity activity = existingActivity.get();
        activity.setName(activityDTO.getName());
        activity.setLocation(activityDTO.getLocation());
        activity.setStartTime(activityDTO.getStartTime());
        activity.setDuration(activityDTO.getDuration());
        activity.setCost(activityDTO.getCost());
        activity.setDate(activityDTO.getDate());
        activity.setLatitude(activityDTO.getLatitude());
        activity.setLongitude(activityDTO.getLongitude());
        activity.setNotes(activityDTO.getNotes());
        
        Activity savedActivity = activityRepository.save(activity);
        return convertToDTO(savedActivity);
    }
    
    public void deleteActivity(Long id) {
        activityRepository.deleteById(id);
    }
    
    public BigDecimal getTotalCostForItinerary(Long itineraryId) {
        List<Activity> activities = activityRepository.findByItineraryId(itineraryId);
        return activities.stream()
                .map(Activity::getCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public List<ActivityDTO> getActivitiesByItineraryIdAndDate(Long itineraryId, LocalDate date) {
        List<Activity> activities = activityRepository.findByItineraryIdAndDateOrderByStartTime(itineraryId, date);
        return activities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private ActivityDTO convertToDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setName(activity.getName());
        dto.setLocation(activity.getLocation());
        dto.setStartTime(activity.getStartTime());
        dto.setDuration(activity.getDuration());
        dto.setCost(activity.getCost());
        dto.setDate(activity.getDate());
        dto.setLatitude(activity.getLatitude());
        dto.setLongitude(activity.getLongitude());
        dto.setNotes(activity.getNotes());
        dto.setItineraryId(activity.getItinerary().getId());
        return dto;
    }
}
