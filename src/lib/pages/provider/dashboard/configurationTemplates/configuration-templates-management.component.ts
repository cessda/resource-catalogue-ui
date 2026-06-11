import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';

import { GuidelinesService } from '../../../../services/guidelines.service';

import {pidHandler} from "../../../../shared/pid-handler/pid-handler.service";

export interface ConfigurationTemplate {
  id: string;
  configurationTemplate: {
    id: string;
    name: string;
    description?: string;
  };
}

@Component({
  selector: 'app-configuration-templates-management',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
  templateUrl: './configuration-templates-management.component.html',
})
export class ConfigurationTemplatesManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private guidelinesService = inject(GuidelinesService);
  private readonly pidHandler = inject(pidHandler);

  guidelineId!: string;

  templates: ConfigurationTemplate[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.guidelineId = this.route.snapshot.paramMap.get('guidelineId')!;
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.error = null;

    this.guidelinesService.getTemplatesForGuidelineWithAuth(this.guidelineId).subscribe({
        next: (res) => {
          this.templates = res ?? [];
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load templates';
          this.loading = false;
        }
      });
  }

  createNew(): void {
    this.router.navigate([
      `/fb/guideline/${this.guidelineId}/model/new`,
    ]);
  }

  edit(template: ConfigurationTemplate): void {
    this.router.navigate([
      `/guideline/${this.guidelineId}/model/${this.pidHandler.customEncodeURIComponent(template.id)}/edit`,
    ]);
  }

  trackById(_: number, t: ConfigurationTemplate): string {
    return t.id;
  }
}
