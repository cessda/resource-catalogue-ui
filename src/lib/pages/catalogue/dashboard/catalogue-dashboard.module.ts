import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {ReusableComponentsModule} from '../../../shared/reusablecomponents/reusable-components.module';
// import {MarkdownModule} from 'ngx-markdown';
import {HighchartsChartModule} from "highcharts-angular";
import {CatalogueDashboardComponent} from "./catalogue-dashboard.component";
import {CatalogueDashboardRouting} from "./catalogue-dashboard.routing";
import {CatalogueProvidersComponent} from "./catalogueProviders/catalogue-providers.component";
import {CatalogueServicesComponent} from "./catalogueServices/catalogue-services.component";
import {CatalogueTrainingResourcesComponent} from "./catalogueTrainingResources/catalogue-training-resources.component";
import {CatalogueDeployableServicesComponent} from "./catalogueDeployableServices/catalogue-deployable-services.component";
import {CatalogueInfoComponent} from "./catalogueInfo/catalogue-info.component";
import {CatalogueHistoryComponent} from "./catalogueHistory/catalogue-history.component";
import {CatalogueFullHistoryComponent} from "./catalogueHistory/catalogue-full-history.component";

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CatalogueDashboardRouting,
    ReusableComponentsModule,
    HighchartsChartModule,
    CatalogueInfoComponent,
    // MarkdownModule.forChild(),

  ],
  declarations: [
    CatalogueDashboardComponent,
    // ProviderStatsComponent,
    CatalogueProvidersComponent,
    CatalogueServicesComponent,
    CatalogueTrainingResourcesComponent,
    CatalogueDeployableServicesComponent,
    CatalogueHistoryComponent,
    CatalogueFullHistoryComponent
    // ServiceStatsComponent
  ]
})

export class CatalogueDashboardModule {
}
