/* 
  Panviva Quick Starts
  API : 47
  Date : 19/10/2022 

  SearchPanvivaCore:  
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
import liveDocument from "@salesforce/apex/PanvivaSdk.liveDocument";
import documentSearch from "@salesforce/apex/PanvivaSdk.documentSearch";


export default class SearchPanviva extends LightningElement {
  @track searchResults;
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
      // clear out previous results
      this.searchResults = null;
      this.notificationMessage = `Searching for "${query}".`;

      liveSearch({ username: this.username, query: query })
        .then(result => {
          this.notifyUsersCore('info', `Searching "${query}" within panviva for user "${this.username}".`);
        })
        .catch(error => {
          this.notifyUsersCore('warning', `That didn\'t work.\n\nPlease validate your settings.`);
          this.errorMessage = error.body.message;
        });

      documentSearch({ term: query, pageLimit: "5" })
        .then(response => {
          let searchResultsJson = JSON.parse(response);
          if (searchResultsJson && searchResultsJson.results && searchResultsJson.results.length && searchResultsJson.results.length > 0) {
            let results = searchResultsJson.results.map((result, index) => {
              result.key = index;
              return result;
            });

            this.searchResults = results;
            this.notificationMessage = `Found ${this.searchResults.length} search results for "${query}". You may want to look at your panviva window for more results.`;
          } else {
            this.searchResults = null;
            var message = `Sorry, I searched for "${query}" but could\'t find anything for you. You may want to look at your panviva window for more results.`;
            this.notificationMessage = message;
            this.notifyUsersCore('warning', message);
          }
        })
        .catch(error => {
          console.error(error);
          this.notifyUsersCore('warning', `That didn\'t work.\n\nPlease validate your settings.`);
        });
    }
  }

  // allow users to see related document 
  handleZoomOutCore(event) {
    // get the related document id
    var documentId = event.target.dataset.id;
    if (documentId) {
      console.log(`Try opening related panviva document #${documentId} to user "${this.username}".`);
      liveDocument({ username: this.username, documentId: documentId })
        .then(response => {
          this.notifyUsersCore('info', `Sent related panviva document #${documentId} to user "${this.username}".`);
        })
        .catch(error => {
          this.notifyUsersCore('warning', 'This didn\'t work.\n\nPlease validate your settings.');
        });
    }
  }

  handleClearResultsCore() {
    this.searchResults = null;
    this.notificationMessage = null;
  }

  // notify users
  notifyUsersCore(variant, message) {
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
