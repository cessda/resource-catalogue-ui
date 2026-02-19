import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {ResourceService} from '../../services/resource.service';
import {Datasource} from '../../domain/eic-model';
import {NavigationService} from "../../services/navigation.service";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {ConfigService} from "../../services/config.service";
import {DatasourceFormComponent} from "./datasource-form.component";
import {DatasourceService} from "../../services/datasource.service";

@Component({
    selector: 'app-add-first-datasource',
    templateUrl: './datasource-form.component.html',
    standalone: false
})
export class AddFirstDatasourceComponent extends DatasourceFormComponent implements OnInit {

  pendingDatasources: Datasource[] = [];
  datasourceId: string;

  constructor(protected injector: Injector,
              protected authenticationService: AuthenticationService,
              protected datasourceService: DatasourceService,
              protected route: ActivatedRoute,
              public dynamicFormService: FormControlService,
              public config: ConfigService) {
    super(injector, authenticationService, datasourceService, route, dynamicFormService, config);
    this.editMode = false;
  }

  ngOnInit() {
    super.ngOnInit();
    this.firstServiceForm = true;
    // this.providerId = this.route.snapshot.paramMap.get('providerId');
    // this.serviceForm.get('resourceOrganisation').setValue(decodeURIComponent(this.providerId));
    this.datasourceId = this.route.snapshot.paramMap.get('datasourceId');
    if (this.datasourceId) {
      this.editMode = true;
      this.datasourceService.getDatasourceBundleById(this.datasourceId, this.catalogueConfigId).subscribe(
        dsBundle => {
          ResourceService.removeNulls(dsBundle.datasource);
          this.formPrepare(dsBundle.datasource);
          this.serviceForm.patchValue(dsBundle.datasource);
          for (const i in this.serviceForm.controls) {
            if (this.serviceForm.controls[i].value === null) {
              this.serviceForm.controls[i].setValue('');
            }
          }
        },
        err => this.errorMessage = 'Something went bad, server responded: ' + err.error);
    }
  }

  onSuccess(service) {
    this.successMessage = 'Training Resource uploaded successfully!';
  }

}
