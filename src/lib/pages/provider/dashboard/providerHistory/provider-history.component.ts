import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoggingInfo, ProviderBundle, Service} from '../../../../domain/eic-model';
import {NavigationService} from '../../../../services/navigation.service';
import {ResourceService} from '../../../../services/resource.service';
import {environment} from '../../../../../environments/environment';
import {ServiceProviderService} from '../../../../services/service-provider.service';
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {ConfigService} from "../../../../services/config.service";


@Component({
    selector: 'app-service-dashboard',
    templateUrl: './provider-history.component.html',
    standalone: false
})
export class ProviderHistoryComponent implements OnInit {

  serviceORresource = environment.serviceORresource;
  catalogueId: string;
  providerId: string;
  providerBundle: ProviderBundle;
  providerHistory: LoggingInfo[];

  public service: Service;
  public errorMessage: string;

  constructor(private route: ActivatedRoute,
              private navigator: NavigationService,
              private resourceService: ResourceService,
              private providerService: ServiceProviderService,
              public pidHandler: pidHandler,
              public config: ConfigService) {
  }

  ngOnInit() {
    this.providerId = this.route.parent.snapshot.paramMap.get('provider');
    this.catalogueId = this.route.parent.snapshot.paramMap.get('catalogueId');
    this.getProvider();

    this.providerService.getProviderLoggingInfoHistory(this.providerId).subscribe(
      res => this.providerHistory = res,
      err => {
        this.errorMessage = 'An error occurred while retrieving the history of this provider. ' + err.error;
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
