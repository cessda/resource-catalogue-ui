import {Component, isDevMode, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication.service';
import {ServiceProviderService} from '../../services/service-provider.service';
import {CatalogueService} from "../../services/catalogue.service";
import {ResourceService} from '../../services/resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Vocabulary, Type} from '../../domain/eic-model';
import {ConfigService} from '../../services/config.service';
import {environment} from '../../../environments/environment';
import {Model} from "../../../dynamic-catalogue/domain/dynamic-form-model";
import {FormControlService} from "../../../dynamic-catalogue/services/form-control.service";
import {SurveyComponent} from "../../../dynamic-catalogue/pages/dynamic-form/survey.component";

declare var UIkit: any;

@Component({
    selector: 'app-catalogue-form',
    templateUrl: './catalogue-form.component.html',
    providers: [FormControlService],
    standalone: false
})
export class CatalogueFormComponent implements OnInit {
  @ViewChild(SurveyComponent) child: SurveyComponent
  model: Model = null;
  payloadAnswer: object = null;
  formDataToSubmit: any = null;

  protected readonly isDevMode = isDevMode;
  catalogueName: string | null = null;
  protected readonly environment = environment;
  _hasUserConsent = environment.hasUserConsent;
  serviceORresource = environment.serviceORresource;
  privacyPolicyURL = environment.privacyPolicyURL;
  onboardingAgreementURL = environment.onboardingAgreementURL;
  catalogueId: string = null;
  errorMessage = '';
  userInfo = {sub:'', family_name: '', given_name: '', email: ''};
  editMode = false;
  hasChanges = false;
  pendingCatalogue = false;
  disable = false;
  showLoader = false;
  isPortalAdmin = false;

  codeOfConduct = false;
  privacyPolicy = false;
  authorizedRepresentative = false;
  onboardingAgreement = false;
  agreedToTerms: boolean;

  vocabularyEntryForm: UntypedFormGroup;
  suggestionsForm = {
    domainsVocabularyEntryValueName: '',
    categoriesVocabularyEntryValueName: '',
    placesVocabularyEntryValueName: '',
    networksVocabularyEntryValueName: '',
    providerTypeVocabularyEntryValueName: '',
    vocabulary: '',
    errorMessage: '',
    successMessage: ''
  };

  commentControl = new UntypedFormControl();

  constructor(public fb: UntypedFormBuilder,
              public authService: AuthenticationService,
              public serviceProviderService: ServiceProviderService,
              public catalogueService: CatalogueService,
              public resourceService: ResourceService,
              public router: Router,
              public route: ActivatedRoute,
              public dynamicFormService: FormControlService,
              public config: ConfigService) {
  }

  ngOnInit() {
    this.catalogueName = this.config.getProperty('catalogueName');

    this.showLoader = true;

    this.serviceProviderService.getFormModelById('m-b-catalogue').subscribe(
      res => this.model = res,
      err => console.log(err),
      () =>  {
        if (!this.editMode) { //prefill field(s)
          const currentUser = this.getCurrentUserInfo();
          this.payloadAnswer = {
            'answer': {
              catalogue: {
                'users': [
                  {
                    name: currentUser.firstname,
                    surname: currentUser.lastname,
                    email: currentUser.email
                  }
                ]
              }
            }
          };
        }
      }
    )

    const path = this.route.snapshot.routeConfig.path;
    if (path.includes('add/:catalogueId')) {
      this.pendingCatalogue = true;
    }
    // if (path.includes('info/:catalogueId')) {
    //   this.pendingCatalogue = true;
    // }

    if (this._hasUserConsent) {
      if (this.editMode) {
        this.catalogueService.hasAdminAcceptedTerms(this.catalogueId, this.pendingCatalogue).subscribe(
          boolean => { this.agreedToTerms = boolean; },
          error => console.log(error),
          () => {
            if (!this.agreedToTerms) {
              UIkit.modal('#modal-consent').show();
            }
          }
        );
      } else {
        if (!this.agreedToTerms) {
          UIkit.modal('#modal-consent').show();
        }
      }
    }

    this.isPortalAdmin = this.authService.isAdmin();

    this.vocabularyEntryForm = this.fb.group(this.suggestionsForm);
  }

  submitForm(formData: any, tempSave: boolean) {
    let catalogueValue = formData.value.catalogue;
    window.scrollTo(0, 0);

    this.errorMessage = '';
    // this.trimFormWhiteSpaces();
    const path = this.route.snapshot.routeConfig.path;
    let method;
    if (path === 'add/:catalogueId') {
      method = 'updateAndActivatePendingProvider';
    } else {
      method = this.editMode ? 'updateCatalogue' : 'createNewCatalogue';
    }

    catalogueValue = FormControlService.cleanObjectInPlace(catalogueValue);

    if (tempSave) {//TODO
      this.showLoader = true;
      window.scrollTo(0, 0);
      this.serviceProviderService.temporarySaveProvider(catalogueValue, (path !== 'add/:catalogueId' && this.editMode))
        .subscribe(
          res => {
            this.showLoader = false;
            this.router.navigate([`/provider/add/${res.id}`]);
          },
          err => {
            this.showLoader = false;
            window.scrollTo(0, 0);
                    this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong on our end. If the problem persists, please contact support with Trace ID: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.message}`;
          },
          () => {
            this.showLoader = false;
          }
        );
    } else {
      this.showLoader = true;
      window.scrollTo(0, 0);

      this.catalogueService[method](catalogueValue, this.commentControl.value).subscribe(
        res => {
        },
        err => {
          this.showLoader = false;
          window.scrollTo(0, 0);
                  this.errorMessage =
          (err?.status >= 500 && err?.status < 600)
            ? `Something went wrong on our end. If the problem persists, please contact support with Trace ID: ${err?.error?.traceId}`
            : `Something went bad, server responded: ${err?.error?.message}`;
        },
        () => {
          this.showLoader = false;
          if (this.editMode) {
            this.router.navigate(['/catalogue/my']);
          } else {
            this.router.navigate(['/catalogue/my']);
            // this.authService.refreshLogin('/catalogue/my'); // fixme: not redirecting
          }
        }
      );
    }

  }

  unsavedChangesPrompt() {
    this.hasChanges = true;
  }

  timeOut(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Terms Modal--> **/
  toggleTerm(term) {
    if (term === 'privacyPolicy') {
      this.privacyPolicy = !this.privacyPolicy;
    } else if (term === 'authorizedRepresentative') {
      this.authorizedRepresentative = !this.authorizedRepresentative;
    } else if (term === 'onboardingAgreement') {
      this.onboardingAgreement = !this.onboardingAgreement;
    }
    this.checkTerms();
  }

  checkTerms() {
    this.agreedToTerms = this.privacyPolicy && this.authorizedRepresentative && this.onboardingAgreement;
  }

  acceptTerms() {
    if (this._hasUserConsent && this.editMode) {
      this.catalogueService.adminAcceptedTerms(this.catalogueId, this.pendingCatalogue).subscribe(
        res => {},
        error => { console.log(error); },
        () => {}
      );
    }
  }

  /** <--Terms Modal **/

  /** Submit Comment Modal--> **/
  showCommentModal(formData: any) {
    if (this.editMode && !this.pendingCatalogue) {
      this.formDataToSubmit = formData;
      UIkit.modal('#commentModal').show();
    } else {
      this.submitForm(formData, false);
    }
  }

  /** <--Submit Comment Modal **/

  submitSuggestion(entryValueName, vocabulary, parent) {
    if (entryValueName.trim() !== '') {
      this.serviceProviderService.submitVocabularyEntry(entryValueName, vocabulary, parent, 'provider', this.catalogueId, null).subscribe(
        res => {
        },
        error => {
          console.log(error);
          this.vocabularyEntryForm.get('errorMessage').setValue(error.error.message);
        },
        () => {
          this.vocabularyEntryForm.reset();
          this.vocabularyEntryForm.get('successMessage').setValue('Suggestion submitted!');
        }
      );
    }
  }

  showNotification() {
    UIkit.notification({
      message: 'Please remove duplicate entries.',
      status: 'danger',
      pos: 'top-center',
      timeout: 7000
    });
  }

  groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) {
        return hash;
      }
      return Object.assign(hash, {[obj[key]]: (hash[obj[key]] || []).concat(obj)});
    }, {});
  }

  getCurrentUserInfo(): { firstname: string; lastname: string; email: string } {
    return {
      firstname: this.authService.getUserName(),
      lastname: this.authService.getUserSurname(),
      email: this.authService.getUserEmail()
    };
  }
}
