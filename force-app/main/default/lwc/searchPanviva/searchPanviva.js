/* 
  Panviva Quick Starts
  API : 47
  Date : 24/2/2020 

  SearchPanviva:  
  - Related Panviva Documents can be sent to a logged in user's Panviva window.
  - This example is running a "Search" where the search results are shown.
  - You could also show the first document by using "showFirstResult:true" on PanvivaSdk.liveSearch.
*/
import { LightningElement, track, wire } from "lwc";
// import to grab user's details
import { getRecord } from "lightning/uiRecordApi";
import EMAIL_FIELD from '@salesforce/schema/User.Email';
import USER_ID from '@salesforce/user/Id';
// import standard toast event 
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
// import panviva api helpers
import liveSearch from "@salesforce/apex/PanvivaSdk.liveSearch";


export default class SearchPanviva extends LightningElement {
  @track errorMessage;
  @track notificationMessage;
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

  // handling user input
  handleKeyPress({ code: keyCode, target: { value: query } }) {
    if (keyCode === "Enter") {
      liveSearch({ username: this.username, query: query })
        .then(result => {
          this.notifyUsers('info', `Searching "${query}" within panviva for user "${this.username}".`);
          this.notificationMessage = `Searching for "${query}".`
        })
        .catch(error => {
          this.notifyUsers('warning', `That didn\'t work.\n\nPlease validate your settings.`);
          this.errorMessage = error.body.message;
        });
    }
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
