import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormBuilderComponent } from '../../../../../dynamic-catalogue/pages/form-builder/form-builder.component';
import { DynamicCatalogueService } from '../../../../../dynamic-catalogue/services/dynamic-catalogue.service';

@Component({
  standalone: true,
  imports: [FormBuilderComponent],
  template:
    '<h1>Configuration Template Form Builder</h1>' +
    '<app-form-builder [customActions]="true" (saveAction)="saveMethod($event)" [backDestination]="backDestination"></app-form-builder>',
})
export class ConfigurationTemplateFormBuilderComponent implements OnInit {
  private dynamicCatalogueService = inject(DynamicCatalogueService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  guidelineId!: string;
  backDestination = '/home';

  ngOnInit() {
    this.guidelineId = this.route.snapshot.paramMap.get('guidelineId')!;
    this.backDestination = '/guidelines/'+this.guidelineId+'/configuration-templates-management';
  }

  saveMethod(data: any) {
    this.dynamicCatalogueService.saveModel(data, false).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log('Failed:', err.message);
      },
    });
  }

}
