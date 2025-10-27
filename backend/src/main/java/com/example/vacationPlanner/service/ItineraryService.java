package com.example.vacationPlanner.service;

import com.example.vacationPlanner.model.Itinerary;
import com.example.vacationPlanner.model.User;
import com.example.vacationPlanner.model.dto.ItineraryDTO;
import com.example.vacationPlanner.repository.ItineraryRepository;
import com.example.vacationPlanner.repository.UserRepository;
import com.example.vacationPlanner.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ItineraryService {
    
    @Autowired
    private ItineraryRepository itineraryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    public List<ItineraryDTO> getItinerariesByUserId(Long userId) {
        List<Itinerary> itineraries = itineraryRepository.findByUserId(userId);
        return itineraries.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<ItineraryDTO> getItineraryById(Long id) {
        return itineraryRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    public ItineraryDTO createItinerary(ItineraryDTO itineraryDTO) {
        Optional<User> user = userRepository.findById(itineraryDTO.getUserId());
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        Itinerary itinerary = new Itinerary();
        itinerary.setName(itineraryDTO.getName());
        itinerary.setLocation(itineraryDTO.getLocation());
        itinerary.setStartDate(itineraryDTO.getStartDate());
        itinerary.setEndDate(itineraryDTO.getEndDate());
        itinerary.setNotes(itineraryDTO.getNotes());
        itinerary.setUser(user.get());
        
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        return convertToDTO(savedItinerary);
    }
    
    public ItineraryDTO updateItinerary(Long id, ItineraryDTO itineraryDTO) {
        Optional<Itinerary> existingItinerary = itineraryRepository.findById(id);
        if (existingItinerary.isEmpty()) {
            throw new RuntimeException("Itinerary not found");
        }
        
        Itinerary itinerary = existingItinerary.get();
        itinerary.setName(itineraryDTO.getName());
        itinerary.setLocation(itineraryDTO.getLocation());
        itinerary.setStartDate(itineraryDTO.getStartDate());
        itinerary.setEndDate(itineraryDTO.getEndDate());
        itinerary.setNotes(itineraryDTO.getNotes());
        
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        return convertToDTO(savedItinerary);
    }
    
    @Transactional
    public void deleteItinerary(Long id) {
        // Check if itinerary exists before attempting deletion
        if (!itineraryRepository.existsById(id)) {
            throw new RuntimeException("Itinerary not found with id: " + id);
        }
        
        System.out.println("Deleting all activities for itinerary ID: " + id);
        // First, delete all activities associated with this itinerary
        activityRepository.deleteByItineraryId(id);
        System.out.println("All activities deleted for itinerary ID: " + id);
        
        System.out.println("Deleting itinerary with ID: " + id);
        // Then delete the itinerary
        itineraryRepository.deleteById(id);
        System.out.println("Itinerary successfully deleted with ID: " + id);
    }
    
    private ItineraryDTO convertToDTO(Itinerary itinerary) {
        ItineraryDTO dto = new ItineraryDTO();
        dto.setId(itinerary.getId());
        dto.setName(itinerary.getName());
        dto.setLocation(itinerary.getLocation());
        dto.setStartDate(itinerary.getStartDate());
        dto.setEndDate(itinerary.getEndDate());
        dto.setNotes(itinerary.getNotes());
        dto.setUserId(itinerary.getUser().getId());
        return dto;
    }
}
