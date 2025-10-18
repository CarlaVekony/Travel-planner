import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ActivitiesService } from '../../services/activities.service';

interface Activity {
  id: number;
  name: string;
  location: string;
  startTime: string;
  duration: string;
  cost: number;
  notes?: string;
}

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activities.html',
  styleUrls: ['./activities.css']
})
export class Activities implements OnInit {
  itineraryId!: number;
  activities: Activity[] = [];

  constructor(private route: ActivatedRoute, private activitiesService: ActivitiesService) {}

  ngOnInit() {
    this.itineraryId = +this.route.snapshot.paramMap.get('id')!;
    this.loadActivities();
  }

  async loadActivities() {
    this.activities = await this.activitiesService.getActivities(this.itineraryId);
  }

  // Add, update, delete activity functions here
}
