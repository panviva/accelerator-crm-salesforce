/* 
  Panviva Quick Starts
  API : 47
  Date : 24/2/2020 

  Help Me:  
  - Show articles based on Live CSH.
*/
import { LightningElement, track, wire, api } from "lwc";
// import to grab user's details
import { getRecord } from "lightning/uiRecordApi";
import EMAIL_FIELD from '@salesforce/schema/User.Email';
import USER_ID from '@salesforce/user/Id';
// import standard toast event 
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
// import panviva api helpers
import liveSearch from "@salesforce/apex/PanvivaSdk.liveSearch";
// import CurrentPageReference toi get context
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
export default class HelpMe extends LightningElement {
  @track errorMessage;
  @track notificationMessage;
  @track toggleIconName = 'utility:preview';
  @track toggleButtonLabel = 'Help me now';
  @track query;

  // Extract logged in user's email
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

  // NOTE: This can be used for "context"
  // Injects the page reference that describes the current page
  @wire(CurrentPageReference) pageRef;

  get currentPageReference() {
    return this.pageRef ? this.pageRef : null;
  }

  renderedCallback() {
    // understand context
    if (this.currentPageReference && this.currentPageReference.attributes && this.currentPageReference.attributes.pageName) {
      // Grab context from the "Page Name"
      this.query = `sf-page-guidance-${this.currentPageReference.attributes.pageName}`.toLowerCase();
      this.notificationMessage = `Using location to determine context for assitance. 
                                  \nLets look for guidance associated with Salesforce's "${this.currentPageReference.attributes.pageName}" page.
                                  \nLookup live/csh for ${this.query} by clicking help.`;
    } else {
      // Use url to determine context
      var url = window.location.href;
      var urlComponents = url.split('lightning/r/');
      if (urlComponents && urlComponents.length == 2) {
        // get record type
        var componentData = urlComponents[1].split('/');
        if (componentData && componentData.length > 2) {
          this.query = `sf-page-guidance-${componentData[0]}`.toLowerCase();
          this.notificationMessage = `Using location to determine context for assitance. 
                                      \nLets look for guidance associated with Salesforce's "${componentData[0]}" page.\
                                      \nLookup live/csh for ${this.query} by clicking help.`;

        }

      }
    }
  }

  // Handles the click button
  handleClick() {
    liveCsh({ username: this.username, query: this.query })
      .then(result => {
        this.notifyUsers('info', `Searching "${this.query}" within panviva for user "${this.username}".`);
        this.notificationMessage = `Searching for guidance on "${this.query}".`
      })
      .catch(error => {
        this.notifyUsers('warning', `That didn\'t work.\n\nPlease validate your settings.`);
        console.log(error);
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
