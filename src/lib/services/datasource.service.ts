import {Injectable} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {environment} from '../../environments/environment';
import {Datasource, DatasourceBundle, LoggingInfo, OpenAIREMetrics, ProviderBundle} from '../domain/eic-model';
import {Paging} from '../domain/paging';
import {ConfigService} from "./config.service";
import {Model} from "../../dynamic-catalogue/domain/dynamic-form-model";

@Injectable()
export class DatasourceService {

  private catalogueConfigId: string;

  constructor(public http: HttpClient, public authenticationService: AuthenticationService, private configService: ConfigService) {
    this.catalogueConfigId = this.configService.getProperty('catalogueId');
  }
  base = environment.API_ENDPOINT;
  private options = {withCredentials: true};

  getDatasource(id: string, catalogueId?: string) {
    id = decodeURIComponent(id);
    // if version becomes optional this should be reconsidered
    // return this.http.get<Service>(this.base + `/service/${version === undefined ? id : [id, version].join('/')}`, this.options);
    if (!catalogueId) catalogueId = this.catalogueConfigId;
    return this.http.get<Datasource>(this.base + `/datasource/${id}?catalogue_id=${catalogueId}`, this.options);
  }

  deleteDatasource(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/datasource/' + id, this.options);
  }

  getDatasourceBundles(from: string, quantity: string, sort: string, order: string, query: string, active: string, suspended: string,
                       status: string, catalogue_id: string[], service_id: string[]) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('sort', sort);
    params = params.append('order', order);
    if (active && active !== '') {
      params = params.append('active', active);
    }
    if (suspended && suspended !== '') {
      params = params.append('suspended', suspended);
    }
    if (status && status !== '') {
      params = params.append('status', status);
    }
    if (query && query !== '') {
      params = params.append('keyword', query);
    }
    if (catalogue_id && catalogue_id.length > 0) {
      for (const catalogueValue of catalogue_id) {
        params = params.append('catalogue_id', catalogueValue);
      }
    }
    // } else params = params.append('catalogue_id', 'all');
    if (service_id && service_id.length > 0) {
      for (const serviceValue of service_id) {
        params = params.append('service_id', decodeURIComponent(serviceValue));
      }
    }
    return this.http.get(this.base + `/datasource/adminPage/all`, {params});
  }

  getDatasourceBundleById(id: string, catalogueId: string) {
    id = decodeURIComponent(id);
    return this.http.get<DatasourceBundle>(this.base + `/datasource/bundle/${id}?catalogue_id=${catalogueId}`, this.options);
  }

  getOpenAIREDatasources(from: string, quantity: string, sort: string, order: string, query: string) {
    let params = new HttpParams();
    params = params.append('from', from);
    params = params.append('quantity', quantity);
    params = params.append('sort', sort);
    params = params.append('order', order);
    params = params.append('keyword', query);
    return this.http.get<Paging<Datasource>>(this.base + '/datasource/openaire/all', {params});
  }

  getOpenAIREDatasourcesById(OAid: string) {
    return this.http.get<Datasource>(this.base + `/datasource/openaire/getById?datasourceId=${OAid}`, this.options);
  }

  isDatasourceRegisteredOnOpenAIRE(datasourceId: string) {
    datasourceId = decodeURIComponent(datasourceId);
    return this.http.get<boolean>(this.base + `/datasource/openaire/isRegistered/${datasourceId}`);
  }

  submitDatasource(datasource: Datasource, shouldPut: boolean) {
    // console.log(JSON.stringify(datasource));
    // console.log(`knocking on: ${this.base}/datasource`);
    // return this.http[shouldPut ? 'put' : 'post']<Datasource>(this.base + '/datasource', datasource, this.options);
    if (shouldPut) {
      return this.http.put<Datasource>(this.base + '/datasource', datasource, this.options); //comment param can be used on update
    } else {
      return this.http.post<Datasource>(this.base + '/datasource', datasource, this.options);
    }
  }

  verifyDatasource(id: string, active: boolean, status: string) {
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/datasource/verify/${id}?active=${active}&status=${status}`, {}, this.options);
  }

  activateDatasource(id: string, active: boolean) { // toggles active/inactive datasource
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/datasource/setActive/${id}?active=${active}`, this.options);
  }

  auditDatasource(id: string, action: string, comment: string) {
    id = decodeURIComponent(id);
    return this.http.patch(this.base + `/datasource/audit/${id}?actionType=${action}&comment=${comment}`, this.options);
  }

/*  getDatasourceByServiceId(serviceId: string, catalogueId?:string){
    serviceId = decodeURIComponent(serviceId);

    if(!catalogueId) catalogueId = this.catalogueConfigId;
    if (catalogueId === this.catalogueConfigId)

      return this.http.get<Datasource>(this.base + `/datasource/byService/${serviceId}?catalogue_id=${catalogueId}`, this.options);
    else
      return this.http.get<Datasource>(this.base + `/catalogue/${catalogueId}/datasource/${serviceId}`, this.options);
  }*/

  getOpenAIREMetrics(datasourceId: string) {
    datasourceId = decodeURIComponent(datasourceId);
    return this.http.get<OpenAIREMetrics>(this.base + `/datasource/isMetricsValid/${datasourceId}`);
  }

  getDatasourceLoggingInfoHistory(datasourceId: string, catalogue_id: string) {
    datasourceId = decodeURIComponent(datasourceId);
    if (catalogue_id === this.catalogueConfigId)
      return this.http.get<LoggingInfo[]>(this.base + `/datasource/loggingInfoHistory/${datasourceId}?catalogue_id=${catalogue_id}`);
    else
      return this.http.get<LoggingInfo[]>(this.base + `/catalogue/${catalogue_id}/datasource/loggingInfoHistory/${datasourceId}`);
  }

  /** Draft Datasources -->**/
  temporarySaveDatasource(datasource: Datasource) {
    const datasourceExists = !!datasource.id;
    if (datasourceExists) {
      return this.http.put<Datasource>(this.base + '/datasource/draft', datasource, this.options);
    }
    return this.http.post<Datasource>(this.base + '/datasource/draft', datasource, this.options);
  }

  submitDraftDatasource(datasource: Datasource) {
    return this.http.put<Datasource>(this.base + '/datasource/draft/transform', datasource, this.options);
  }

  getDraftDatasourcesByProvider(id: string, from: string, quantity: string, order: string, sort: string) {
    id = decodeURIComponent(id);
    return this.http.get<Paging<DatasourceBundle>>(this.base +
      `/datasource/draft/byProvider/${id}?from=${from}&quantity=${quantity}&order=${order}&sort=${sort}`);
  }

  getDraftDatasource(id: string) {
    id = decodeURIComponent(id);
    return this.http.get<any>(this.base + `/datasource/draft/${id}`, this.options);
  }

  deleteDraftDatasource(id: string) {
    id = decodeURIComponent(id);
    return this.http.delete(this.base + '/datasource/draft/' + id, this.options);
  }
  /** <-- Draft Datasources **/

  suspendDatasource(datasourceId: string, catalogueId: string, suspend: boolean) {
    datasourceId = decodeURIComponent(datasourceId);
    return this.http.put<DatasourceBundle>(this.base + `/datasource/suspend?id=${datasourceId}&catalogueId=${catalogueId}&suspend=${suspend}`, this.options);
  }

}
