import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ResourceService} from '../../services/resource.service';
import {Indicator, Measurement, Type, Vocabulary} from '../../domain/eic-model';
import {Paging} from '../../domain/paging';

@Component({
  selector: 'app-measurements',
  templateUrl: 'measurements.component.html'
})

export class MeasurementsComponent implements OnInit {
  errorMessage = '';
  measurements: Measurement[] = [];
  indicators: Paging<Indicator>;
  serviceId: string;
  places: Vocabulary[] = null;
  placesVocabulary: Vocabulary[] = null;

  constructor(private resourceService: ResourceService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    this.getIndicatorIds();
    this.getLocations();
    this.resourceService.getServiceMeasurements(this.serviceId).subscribe(
      res => this.measurements = res.results,
      er => console.log(er)
    );
  }

  getLocations() {
    this.resourceService.getNewVocabulariesByType(Type.COUNTRY).subscribe(
      suc => {
        this.places = suc;
        this.placesVocabulary = this.places;
      }
    );
  }

  getIndicatorIds() {
    this.resourceService.getAllIndicators('indicator').subscribe(
      indicatorPage => this.indicators = indicatorPage,
      error => this.errorMessage = error,
      () => this.indicators.results.sort((a, b) => 0 - (a.id > b.id ? -1 : 1))
    );
  }

  getIndicatorName(id: string): string {
    for (let i = 0; i < this.indicators.results.length; i++) {
      if (this.indicators.results[i].id === id) {
        return this.indicators.results[i].name;
      }
    }
  }

  setLocationName(placesIds: string[]): string[] {
    const placeNames: string[] = [];
    for (let i = 0; i < placesIds.length; i++) {
      placeNames.push(this.placesVocabulary.entries[placesIds[i]].name);
    }

    return placeNames;
  }

  setUnit(indicatorId: string): string {
    for (let i = 0; this.indicators.results.length; i++) {
      if (this.indicators.results[i].id === indicatorId) {
        return this.indicators.results[i].unitName;
      }
    }
    return '';
  }
}
