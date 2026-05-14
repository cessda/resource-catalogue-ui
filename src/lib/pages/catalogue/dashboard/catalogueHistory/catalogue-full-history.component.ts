import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Service, LoggingInfo, CatalogueBundle} from '../../../../domain/eic-model';
import {CatalogueService} from "../../../../services/catalogue.service";
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";


@Component({
  selector: 'app-catalogue-dashboard-full-history',
  templateUrl: './catalogue-full-history.component.html',
  standalone: false
})
export class CatalogueFullHistoryComponent implements OnInit {

  catalogueId: string;
  catalogueBundle: CatalogueBundle;

  public service: Service;
  public errorMessage: string;

  catalogueHistory: LoggingInfo[];

  constructor(private route: ActivatedRoute,
              private catalogueService: CatalogueService,
              public pidHandler: pidHandler) {
  }

  ngOnInit() {
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogue');
    this.getProvider();

    this.catalogueService.getCatalogueLoggingInfoHistory(this.catalogueId).subscribe(
      res => this.catalogueHistory = res,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this service. ' + err.error;
      }
    );
  }

  getProvider() {
    this.catalogueService.getCatalogueBundleById(this.catalogueId).subscribe(
      catalogueBundle => {
        this.catalogueBundle = catalogueBundle;
      }, error => {
        console.log(error);
      }
    );
  }

}
