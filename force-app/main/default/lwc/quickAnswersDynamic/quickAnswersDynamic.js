/* 
  Panviva Quick Starts
  API : 47
  Date : 24/2/2020 

  QuickAnswers:
  - Quick answers are derived from Panviva Artefacts.
  - Quick answers also allow you to navigate to the associated Panviva Document.
*/
import { LightningElement, api, track, wire } from "lwc";
// import to grab user's details
import { getRecord } from "lightning/uiRecordApi";
import EMAIL_FIELD from '@salesforce/schema/User.Email';
import USER_ID from '@salesforce/user/Id';
// import standard toast event 
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
// import panviva api helpers
import liveDocument from "@salesforce/apex/PanvivaSdk.liveDocument";
import artefactSearch from "@salesforce/apex/PanvivaSdk.artefactSearch";
// import CurrentPageReference toi get context
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

export default class QuickAnswers extends LightningElement {
  @track artefact;
  @track artefactAsPlaintext = [];
  @track relatedDocument;
  @track linkedArtefactList = [];
  @track notificationMessage;
  @track query;
  @wire(getRecord, {
    recordId: USER_ID,
    fields: [EMAIL_FIELD]
  }) wireuse({
    error,
    data
  }) {
    if (error) {
      this.errorMessage = error;
    } else if (data) {
      this.username = data.fields.Email.value.split('@')[0];
    }
  }

  value = "CaseOverview";

  // NOTE: This can be used for "context"
  // Injects the page reference that describes the current page
  @wire(CurrentPageReference) pageRef;

  get currentPageReference() {
    return this.pageRef ? this.pageRef : null;
  }

  get options() {
    var dropdownValues = [
      { label: 'Case Overview', value: 'CaseOverview' },
      { label: 'Log a Call', value: 'LogACall' },
      { label: 'Activating a Case', value: 'ActivateCase' },
      { label: 'Creating a New Task', value: 'NewTask' }
    ];

    return dropdownValues;
  }

  // call method on load
  async connectedCallback() {
    // Note to developer: 
    // -----------------
    // As this is a quick start, the inital query is just '*'.
    // You can supercharge your integration by customizing this 
    // to get you relevent 'quick answers' or 'snippets' or 'artefacts'
    // displayed within your component. 
    // You could search/filter/facet based on context derived from salesforce.

    // In this example we derive context based on the location of the widget
    if (this.currentPageReference && this.currentPageReference.attributes && this.currentPageReference.attributes.pageName) {
      // Grab context from the "Page Name"
      this.query = `sf-page-guidance-v2-${this.currentPageReference.attributes.pageName}`.toLowerCase();
      this.notificationMessage = `Using location to determine context for assitance. 
                                  \nThis is guidance associated with Salesforce's "${this.currentPageReference.attributes.pageName}" page.
                                  \nLookup quick answers with scope ${this.query}..`;
    } else {
      // Use url to determine context
      var url = window.location.href;
      var urlComponents = url.split('lightning/r/');
      if (urlComponents && urlComponents.length == 2) {
        // get record type
        var componentData = urlComponents[1].split('/');
        if (componentData && componentData.length > 2) {
          this.query = `sf-page-guidance-v2-${componentData[0]}`.toLowerCase();
          this.notificationMessage = `Using location to determine context for assitance. 
                                      \nThis is guidance associated with Salesforce's "${componentData[0]}" page.\
                                      \nLookup quick answers with scope ${this.query}..`;
        }
      }
    }

    // If we happen to get a valid query we'll filter with it. 
    let initalQuery = '*';
    let artefactSearchPayload = { simplequery: initalQuery };
    let notifyErrorMessage = `Sorry, I searched for "${initalQuery}" but could\'t find anything for you.`;
    if (this.query) {
      artefactSearchPayload.filter = `metaData/scope/values/any(scope: scope eq '${this.query}')`;
      notifyErrorMessage = `Sorry, I searched for quick answers with the scope set to "${this.query}" but could\'t find anything for you.`;
    }

    try {
      const artefactsJson = await artefactSearch(artefactSearchPayload);
      const artefacts = JSON.parse(artefactsJson);
      if (artefacts?.results?.length > 0) {
        const [overviewArtefact] = artefacts.results;
        if (overviewArtefact?.metaData?.linkedScopes?.values > 0) {
          
        }
      }
    } catch (error) {

    } finally  {

    }

    artefactSearch(artefactSearchPayload)
      .then(response => {
        let artefacts = JSON.parse(response);
        if (artefacts && artefacts.results && artefacts.results.length && artefacts.results.length > 0) {
          this.artefact = artefacts.results[0];
          this.relatedDocument = this.artefact.panvivaDocumentId;
          this.artefactAsPlaintext = this.artefact.content.map((node, index) => {
            return {
              key: index,
              text: node.text
            };
          });
          // this.notifyUsers('info', `Found ${artefacts.results.length} results. Showing you the top result.`);

        } else {
          this.notifyUsers('warning', notifyErrorMessage);
        }
      })
      .catch(error => {
        this.notifyUsers('warning', `That didn\'t work.\n\nPlease validate your settings.`);
      });
  }

  // allow users to see related document 
  handleZoomOut() {
    liveDocument({ username: this.username, documentId: this.relatedDocument })
      .then(response => {
        this.notifyUsers('info', `Sent related panviva document #${this.relatedDocument} to user "${this.username}".`);
      })
      .catch(error => {
        this.notifyUsers('warning', 'This didn\'t work.\n\nPlease validate your settings.');
      });
  }

  // notify users
  notifyUsers(variant, message) {
    if (ShowToastEvent) {
      // fire toast event 
      const event = new ShowToastEvent({
        variant: variant,
        message: message,
      });
      this.dispatchEvent(event);
    } else {
      alert(message);
    }
    console.log('Panviva', variant, message);
  }
}
