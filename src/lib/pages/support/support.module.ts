/**
 * Created by stefania on 6/7/17.
 */
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReusableComponentsModule} from '../../shared/reusablecomponents/reusable-components.module';
import {SharedModule} from '../../shared/shared.module';
import {DevelopersComponent} from './developers/developers.component';
import {OpenAPIComponent} from './openapi/openapi.component';
import {SupportRouting} from './support.routing';
import {AboutComponent} from "./about/about.component";

@NgModule({
  imports: [
    CommonModule,
    SupportRouting,
    ReusableComponentsModule,
    SharedModule,
  ],
  declarations: [
    AboutComponent,
    DevelopersComponent,
    OpenAPIComponent
  ],
  providers: []
})
export class SupportModule {
}
