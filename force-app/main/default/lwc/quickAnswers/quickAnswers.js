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

export default class QuickAnswers extends LightningElement {
  @track artefact;  
  @track artefactAsPlaintext = [];
  @track relatedDocument;
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

  // call method on load
  connectedCallback() {
    // Note to developer: 
    // -----------------
    // As this is a quick start, the inital query is just '*'.
    // You can supercharge your integration by customizing this 
    // to get you relevent 'quick answers' or 'snippets' or 'artefacts'
    // displayed within your component. 
    // You could search/filter/facet based on context derived from salesforce.
    let initalQuery = '*';
    artefactSearch({ simplequery: initalQuery })
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
          this.notifyUsers('info', `Found ${artefacts.results.length} results. Showing you the top result.`);

        } else {
          this.notifyUsers('warning', `Sorry, I searched for "${initalQuery}" but could\'t find anything for you.`);
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
