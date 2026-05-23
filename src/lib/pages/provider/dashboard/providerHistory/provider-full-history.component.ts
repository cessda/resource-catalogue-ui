import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProviderBundle, Service, LoggingInfo} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {Paging} from '../../../../domain/paging';
import {environment} from '../../../../../environments/environment';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {ConfigService} from "../../../../services/config.service";

@Component({
    selector: 'app-service-dashboard',
    templateUrl: './provider-full-history.component.html',
    standalone: false
})
export class ProviderFullHistoryComponent implements OnInit {

  serviceORresource = environment.serviceORresource;
  catalogueId: string;
  providerId: string;
  providerBundle: ProviderBundle;

  public service: Service;
  public errorMessage: string;

  providerHistory: LoggingInfo[];

  constructor(private route: ActivatedRoute,
              private navigator: NavigationService,
              private resourceService: ResourceService,
              private providerService: ServiceProviderService,
              private config: ConfigService) {
  }

  ngOnInit() {
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogueId');
    this.getProvider();

    this.providerService.getProviderLoggingInfoHistory(this.providerId).subscribe(
      res => this.providerHistory = res,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this service. ' + err.error;
      }
    );
  }

  getProvider() {
    this.providerService.getServiceProviderBundleById(this.providerId).subscribe(
      providerBundle => {
        this.providerBundle = providerBundle;
      }, error => {
        console.log(error);
      }
    );
  }

}
