import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanActivateViaAuthGuard} from '../../../../services/can-activate-auth-guard.service';
import {DatasourceHistoryComponent} from './datasource-history.component';
import {DatasourceFullHistoryComponent} from './datasource-full-history.component';
import {DatasourceDashboardComponent} from './datasource-dashboard.component';
import {
  ResourceGuidelinesFormComponent
} from "../../../provider-resources/resource-guidelines/resource-guidelines-form.component";
import {ConfigurationTemplatesComponent} from "../configurationTemplates/configuration-templates.component";

const datasourceDashboardRoutes: Routes = [
  {
    path: ':datasourceId',
    component: DatasourceDashboardComponent,
    canActivate: [CanActivateViaAuthGuard],
    data: {
      breadcrumb: 'Datasource Dashboard'
    },
    children : [
      {
        path: '',
        redirectTo: 'history',
        pathMatch: 'full',
        // data: {
        //   breadcrumb: 'Statistics'
        // }
      },
      {
        path: 'history',
        component: DatasourceHistoryComponent
      },
      {
        path: 'fullHistory',
        component: DatasourceFullHistoryComponent
      },
      {
        path: 'assignGuidelines',
        component: ResourceGuidelinesFormComponent

      },
      {
        path: 'templatesForGuideline/:guidelineId',
        component: ConfigurationTemplatesComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(datasourceDashboardRoutes)],
  exports: [RouterModule]
})

export class DatasourceDashboardRouting {
}
