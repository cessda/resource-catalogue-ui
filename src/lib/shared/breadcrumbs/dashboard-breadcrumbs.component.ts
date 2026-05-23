import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {pidHandler} from "../pid-handler/pid-handler.service";

@Component({
    selector: 'app-dashboard-breadcrumbs',
    templateUrl: './dashboard-breadcrumbs.component.html',
    standalone: false
})
export class DashboardBreadcrumbsComponent implements OnInit {

  catalogueId: string;
  providerId: string;
  resourceId: string;
  pathToDashboard: string;
  isSharedDashboard = -1;

  constructor(private activatedRoute: ActivatedRoute, public pidHandler: pidHandler) {}

  ngOnInit() {

    this.catalogueId = this.activatedRoute.snapshot.paramMap.get('catalogueId');
    this.providerId = this.activatedRoute.snapshot.paramMap.get('providerId');
    this.resourceId = this.activatedRoute.snapshot.paramMap.get('resourceId');

    this.isSharedDashboard = window.location.href.indexOf("shared-resource-dashboard");

    this.pathToDashboard = '/dashboard/' + this.pidHandler.customEncodeURIComponent(this.catalogueId) + '/' + this.pidHandler.customEncodeURIComponent(this.providerId);
  }

}
