import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var google: any;

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.css']
})
export class LocationPickerComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  @Input() initialLat: number = 44.4268; // Default to Bucharest
  @Input() initialLng: number = 26.1025;
  @Input() initialLocation: string = '';
  @Output() locationSelected = new EventEmitter<{lat: number, lng: number, address: string}>();

  selectedAddress: string = this.initialLocation;
  latitude: number = this.initialLat;
  longitude: number = this.initialLng;
  
  private map: any;
  private marker: any;
  private geocoder: any;
  private isGoogleMapsLoaded = false;

  ngOnInit() {
    this.selectedAddress = this.initialLocation;
    this.latitude = this.initialLat;
    this.longitude = this.initialLng;
    
    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      this.initializeMap();
    } else {
      // Wait for Google Maps to load
      this.waitForGoogleMaps();
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private waitForGoogleMaps() {
    const checkGoogleMaps = () => {
      if (typeof google !== 'undefined' && google.maps) {
        this.initializeMap();
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
  }

  private initializeMap() {
    if (this.isGoogleMapsLoaded) return;
    
    this.isGoogleMapsLoaded = true;
    
    // Initialize map
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: { lat: this.latitude, lng: this.longitude },
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true
    });

    // Initialize geocoder
    this.geocoder = new google.maps.Geocoder();

    // Create marker
    this.marker = new google.maps.Marker({
      position: { lat: this.latitude, lng: this.longitude },
      map: this.map,
      draggable: true,
      title: 'Selected Location'
    });

    // Add click listener to map
    this.map.addListener('click', (event: any) => {
      this.updateMarkerPosition(event.latLng);
    });

    // Add drag listener to marker
    this.marker.addListener('dragend', (event: any) => {
      this.updateMarkerPosition(event.latLng);
    });

    // Get initial address
    this.getAddressFromCoordinates(this.latitude, this.longitude);
  }

  private updateMarkerPosition(latLng: any) {
    const lat = latLng.lat();
    const lng = latLng.lng();
    
    this.latitude = lat;
    this.longitude = lng;
    
    this.marker.setPosition(latLng);
    this.map.setCenter(latLng);
    
    this.getAddressFromCoordinates(lat, lng);
  }

  private getAddressFromCoordinates(lat: number, lng: number) {
    if (!this.geocoder) return;

    this.geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        this.selectedAddress = results[0].formatted_address;
      } else {
        this.selectedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    });
  }

  onSearchLocation() {
    if (!this.geocoder || !this.selectedAddress.trim()) return;

    this.geocoder.geocode({ address: this.selectedAddress }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        this.latitude = lat;
        this.longitude = lng;
        
        // Update map and marker
        const newPosition = { lat, lng };
        this.marker.setPosition(newPosition);
        this.map.setCenter(newPosition);
        this.map.setZoom(15);
      }
    });
  }

  confirmLocation() {
    this.locationSelected.emit({
      lat: this.latitude,
      lng: this.longitude,
      address: this.selectedAddress
    });
  }
}