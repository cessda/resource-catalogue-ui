import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../services/authentication.service';
import {ResourceService} from '../../../../services/resource.service';
import {ServiceExtensionsService} from '../../../../services/service-extensions.service';
import {NavigationService} from '../../../../services/navigation.service';
import {ConfigService} from "../../../../services/config.service";
import {environment} from '../../../../../environments/environment';
import {DatasourceBundle} from "../../../../domain/eic-model";
import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";
import {DatasourceService} from "../../../../services/datasource.service";


@Component({
    selector: 'app-datasource-dashboard',
    templateUrl: './datasource-dashboard.component.html',
    standalone: false
})
export class DatasourceDashboardComponent implements OnInit {
  catalogueConfigId: string | null = null;
  protected readonly environment = environment;
  _marketplaceTrainingResourcesURL = environment.marketplaceTrainingResourcesURL;

  catalogueId: string;
  providerId: string;
  datasourceId: string;
  monitoringId: string;
  helpdeskId: string;

  datasourceBundle: DatasourceBundle;

  constructor(public authenticationService: AuthenticationService,
              public resourceService: ResourceService,
              public datasourceService: DatasourceService,
              public serviceExtensionsService: ServiceExtensionsService,
              public navigator: NavigationService,
              private route: ActivatedRoute,
              public pidHandler: pidHandler,
              public config: ConfigService) {
  }

  ngOnInit() {
    this.catalogueConfigId = this.config.getProperty('catalogueId');
    this.catalogueId = this.route.snapshot.paramMap.get('catalogueId');
    this.providerId = this.route.snapshot.paramMap.get('providerId');
    this.datasourceId = this.route.snapshot.paramMap.get('datasourceId');
    this.datasourceService.getDatasourceBundleById(this.datasourceId, this.catalogueId).subscribe(
      res => { if (res!=null) this.datasourceBundle = res },
      error => {},
      () => {
        // this.serviceExtensionsService.getMonitoringByServiceId(this.datasourceId).subscribe(
        //   res => { if (res!=null) this.monitoringId = res.id }
        // );
        // this.serviceExtensionsService.getHelpdeskByServiceId(this.datasourceId).subscribe(
        //   res => { if (res!=null) this.helpdeskId = res.id }
        // );
      }
    );
  }

}
