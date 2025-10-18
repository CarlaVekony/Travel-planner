import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItinerariesService } from '../../services/itineraries.service';

interface Itinerary {
  id: number;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

@Component({
  selector: 'app-itineraries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './itineraries.html',
  styleUrls: ['./itineraries.css']
})
export class Itineraries implements OnInit {
  itineraries: Itinerary[] = [];
  newItinerary: Partial<Itinerary> = {};

  constructor(private itinerariesService: ItinerariesService, private router: Router) {}

  ngOnInit() {
    this.loadItineraries();
  }

  async loadItineraries() {
    this.itineraries = await this.itinerariesService.getItineraries();
  }

  async addItinerary() {
    if (!this.newItinerary.name || !this.newItinerary.location) return;
    await this.itinerariesService.createItinerary(this.newItinerary);
    this.newItinerary = {};
    this.loadItineraries();
  }

  async deleteItinerary(id: number) {
    await this.itinerariesService.deleteItinerary(id);
    this.loadItineraries();
  }

  updateItinerary(itinerary: Itinerary) {
    // For simplicity, maybe open modal or navigate to form
    // Implement as needed
  }

  openItinerary(itinerary: Itinerary) {
    this.router.navigate([`/itineraries/${itinerary.id}/activities`]);
  }
}
