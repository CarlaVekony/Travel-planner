package com.example.vacationPlanner.controller;

import com.example.vacationPlanner.model.dto.ItineraryDTO;
import com.example.vacationPlanner.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/itineraries")
@CrossOrigin(origins = "http://localhost:4200")
public class ItineraryController {
    
    @Autowired
    private ItineraryService itineraryService;
    
    @GetMapping
    public ResponseEntity<List<ItineraryDTO>> getItineraries(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            List<ItineraryDTO> itineraries = itineraryService.getItinerariesByUserId(userId);
            return ResponseEntity.ok(itineraries);
        }
        return ResponseEntity.ok(List.of());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ItineraryDTO> getItinerary(@PathVariable Long id) {
        Optional<ItineraryDTO> itinerary = itineraryService.getItineraryById(id);
        return itinerary.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<ItineraryDTO> createItinerary(@RequestBody ItineraryDTO itineraryDTO) {
        try {
            ItineraryDTO createdItinerary = itineraryService.createItinerary(itineraryDTO);
            return ResponseEntity.ok(createdItinerary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ItineraryDTO> updateItinerary(@PathVariable Long id, @RequestBody ItineraryDTO itineraryDTO) {
        try {
            ItineraryDTO updatedItinerary = itineraryService.updateItinerary(id, itineraryDTO);
            return ResponseEntity.ok(updatedItinerary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItinerary(@PathVariable Long id) {
        try {
            System.out.println("Attempting to delete itinerary with ID: " + id);
            itineraryService.deleteItinerary(id);
            System.out.println("Successfully deleted itinerary with ID: " + id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            System.err.println("Error deleting itinerary with ID " + id + ": " + e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Unexpected error deleting itinerary with ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
