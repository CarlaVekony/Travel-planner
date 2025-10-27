package com.example.vacationPlanner.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private Integer duration; // in minutes

    @Column(nullable = false)
    private BigDecimal cost;

    @Column(nullable = false)
    private LocalDate date;

    private Double latitude;
    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getLocation() {
    return location;
  }

  public LocalTime getStartTime() {
    return startTime;
  }

  public Integer getDuration() {
    return duration;
  }

  public BigDecimal getCost() {
    return cost;
  }

  public LocalDate getDate() {
    return date;
  }

  public Double getLatitude() {
    return latitude;
  }

  public String getNotes() {
    return notes;
  }

  public Double getLongitude() {
    return longitude;
  }

  public Itinerary getItinerary() {
    return itinerary;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public void setName(String name) {
    this.name = name;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public void setStartTime(LocalTime startTime) {
    this.startTime = startTime;
  }

  public void setDuration(Integer duration) {
    this.duration = duration;
  }

  public void setCost(BigDecimal cost) {
    this.cost = cost;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }

  public void setLatitude(Double latitude) {
    this.latitude = latitude;
  }

  public void setLongitude(Double longitude) {
    this.longitude = longitude;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  public void setItinerary(Itinerary itinerary) {
    this.itinerary = itinerary;
  }
}
