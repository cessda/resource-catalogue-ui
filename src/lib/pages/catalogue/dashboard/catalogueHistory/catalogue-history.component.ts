import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CatalogueBundle, LoggingInfo, Service} from '../../../../domain/eic-model';
import {CatalogueService} from "../../../../services/catalogue.service";
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";


@Component({
  selector: 'app-catalogue-history-dashboard',
  templateUrl: './catalogue-history.component.html',
  standalone: false
})
export class CatalogueHistoryComponent implements OnInit {

  catalogueId: string;
  catalogueBundle: CatalogueBundle;
  providerHistory: LoggingInfo[];

  public service: Service;
  public errorMessage: string;

  constructor(private route: ActivatedRoute,
              private catalogueService: CatalogueService,
              public pidHandler: pidHandler) {
  }

  ngOnInit() {
    // console.log(this.route.parent.snapshot)
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogue');
    this.getCatalogue();

    this.catalogueService.getCatalogueLoggingInfoHistory(this.catalogueId).subscribe(
      res => this.providerHistory = res,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this catalogue. ' + err.error;
      }
    );
  }

  getCatalogue() {
    this.catalogueService.getCatalogueBundleById(this.catalogueId).subscribe(
      catalogueBundle => {
        this.catalogueBundle = catalogueBundle;
        console.log(catalogueBundle);
      }, error => {
        console.log(error);
      }
    );
  }

}
