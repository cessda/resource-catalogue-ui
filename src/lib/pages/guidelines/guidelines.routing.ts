import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../services/can-activate-auth-guard.service';
import {GuidelinesFormComponent} from "./guidelines-form.component";
import {GuidelinesListComponent} from "../admin/guidelines-list.component";
import {UpdateGuidelinesFormComponent} from "./update-guidelines-form.component";
import {FormBuilderComponent} from "../../../dynamic-catalogue/pages/form-builder/form-builder.component";
import {ConfigurationTemplatesManagementComponent} from "../provider/dashboard/configurationTemplates/configuration-templates-management.component";

const guidelinesRoutes: Routes = [

  {
    path: ':providerId/add',
    component: GuidelinesFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'New Guideline'
    }
  },
  {
    path: ':providerId/update/:guidelineId',
    component: UpdateGuidelinesFormComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Update Guideline'
    }
  },
  {
    path: 'all',
    component: GuidelinesListComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Guidelines List'
    }
  },
  {
    path: ':guidelineId/configuration-templates-management', //GET the conf models that you have access to
    component: ConfigurationTemplatesManagementComponent,
    data: {
      breadcrumb: 'Configuration Templates Management'
    }
  },
  {
    path: ':guidelineId/model/:id/edit', //GET model with id to edit OR GET base template model and POST instead of PUT
    component: FormBuilderComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(guidelinesRoutes)],
  exports: [RouterModule]
})

export class GuidelinesRouting {
}
