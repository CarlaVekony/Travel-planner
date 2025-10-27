package com.example.vacationPlanner.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    private Long id;
    private String name;
    private String location;
    private LocalTime startTime;
    private Integer duration;
    private BigDecimal cost;
    private LocalDate date;
    private Double latitude;
    private Double longitude;
    private String notes;
    private Long itineraryId;

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

  public Double getLongitude() {
    return longitude;
  }

  public String getNotes() {
    return notes;
  }

  public Long getItineraryId() {
    return itineraryId;
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

  public void setItineraryId(Long itineraryId) {
    this.itineraryId = itineraryId;
  }
}
