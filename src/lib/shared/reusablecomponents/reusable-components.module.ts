import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ReadMoreComponent, ReadMoreTextComponent} from './read-more.component';
import { provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from "@angular/common/http";

@NgModule({ declarations: [
        ReadMoreComponent,
        ReadMoreTextComponent
    ],
    exports: [
        ReadMoreComponent,
        ReadMoreTextComponent
    ], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule], providers: [
        provideHttpClient(withInterceptorsFromDi(), withJsonpSupport())
    ] })
export class ReusableComponentsModule {
}
