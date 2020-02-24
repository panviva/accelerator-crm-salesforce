# Salesforce Quick-Start

## The problem
Provide a one stop shop for your teams by combining the power of Salesforce and Panviva.

Whether it's process, product and really important compliance rules, Panviva makes sure the right answer is available every time all within your Salesforce screen.   Slash the time it takes to search for information, when contextual knowledge nuggets are pushed to your team as they move through their salesforce processes and screens.

## Our solution
We're using lightening web components.
We have built 3 components, namely:
- quickAnswers
- searchPanviva
- helpMe (coming soon)

### quickAnswers
It's meant to give you a quick answer based on context.
Quick answers are derived from Panviva Artefacts.
Quick answers also allow you to navigate to the associated Panviva Document.
In the default example it pulls a random artefact. 
You can supercharge your integration by search/filter/facet based on context derived from within salesforce.

### searchPanviva
Related Panviva Documents can be sent to a logged in user's Panviva window.
This example is running a "Search" where the search results are shown within Panviva window.
You could also show the first document by using "showFirstResult:true" on PanvivaSdk.liveSearch.

## Disclaimer 
Meant to be a quickstart. Use our code as a starting point. Validate before deploying.

## Pre Requisites

### Tools
- JDK 11 https://www.oracle.com/java/technologies/javase-jdk11-downloads.html
- Visual Studio Code https://code.visualstudio.com/download
- Salesforce CLI https://developer.salesforce.com/tools/sfdxcli
- Visual Studio Extensions https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode

** Note: If this is the first time you're installing the vs extensions, please ensure that you've reloaded your vscode to enable to extensions.

### Environments You Need
- A Salesforce Instance: If you dont already have one, sign up for one at https://developer.salesforce.com/signup (Note: The email account you sign up with must use the same username as your panviva instace. Eg: John Smith jsmith@codeinnature.com must have his panviva username set as "jsmith")
- A Panviva Instance: Panviva Core + Digital Orchestrator
- A Panviva API Subscription: If you dont have one already, register at https://dev.panviva.com


### Gather your details:
- Panviva "instance name": viva-bank
- Panviva Base URL: https://api.panviva.com/v3/viva-bank/
- Panviva API Key: 


## Salesforce Setup Steps
### Enable Salesforce to call Panviva Apis
> Settings > Security > Remote Site Settings > New Remote Site 

* Remote Site Name: Panviva_API_Portal
* Remote Site URL: https://api.panviva.com

![New Remote Site](documentation/images/remote-site-settings.PNG)

### Add custom settings for Panviva Apis:
> Setup > PLATFORM TOOLS > Custom Code > Custom Settings > New

* Label: Panviva API Settings
* Object Name: Pv_Api_Settings

![Add custom settings](documentation/images/pv-api-settings.PNG)

### Add custom fields for "Pv_Api_Settings"
Data Type | Field Label | Length | Field Name
--- | --- | --- | ---
Text | Base URL | 255 | Base_URL
Text | Subscription Key | 32 | Ocp_Apim_Subscription_Key

![Add fields to custom setting](documentation/images/pv-api-settings-custom-fields.PNG)

### Add values to custom fields
> Setup > PLATFORM TOOLS > Custom Code > Custom Settings > "Panviva API Settings" > Action > Manage > New (Default Organization Level Value)

To find your Panviva API subscription key for the "Subscription Key" field, you will need to log in to the Panviva developer portal at [dev.panviva.com](dev.panviva.com), and in your profile page you will be able to reveal your key.

![Find your Panviva API key](documentation/images/pv-portal-profile-keys.PNG)

To find your base URL for the "Base URL" field, you will need to log into the same Panviva API portal but this time navigate into your API page. You will find the URL on the documentation of any of the endpoints.

![Find your Panviva base URL](documentation/images/pv-portal-base-uri.PNG)

You will then be able to fill these values out in SalesForce

![Add fields to custom setting](documentation/images/pv-api-settings-custom-fields-values.PNG)

#### If its a new environment, setup your domain
> Setup > SETTINGS > Company Settings > My Domain
Enter your domain name: e.g "test-viva-bank" https://test-viva-bank-dev-ed.my.salesforce.com/ (note, this needs to be unique)

Click "Check Availablility" > Click "Register Domain"
It takes ~ 1-5 minute for "Domain Registeration" to finish after which you will need to reload your page, and click the "Log in" button to log in to the new domain. You may prompted to register your phone number, this is optional.

Finally, deploy your domain by clicking the "Deploy to Users" button on the same page.

## Code Setup Steps
This guide helps Salesforce developers who are new to Visual Studio Code go from zero to a deployed app using Salesforce Extensions for VS Code and Salesforce CLI.

Before you start, you need to clone the repository. After opening the folder in Visual Studio Code if you've set up your extensions as detailed above you can press Ctrl + Shift + P and then type in "sfdx" to get a prompt to issue salesforce commands.

### Setting a default org
The first step is to set a default organisation for your project, which will involve logging in to authenticate and then authorising.

In Visual Studio Code, first select "SFDX: Set a Default Org" using Ctrl+Shift+P

![Set a Default Org](documentation/images/1-set-default-org.png)

You will be presented with a sub menu, select "Authorize an Org"

![Authorise an Org](documentation/images/2-authorize-an-org.png)

You will get another sub menu where you need to select "Project Default"

![Project Default](documentation/images/3-choose-project-default.png)

There will be one final sub menu where you can simply press enter to select the default alias value

![Default value](documentation/images/4-use-default-alias.png)

Once this is done, your browser should open and you will be prompted to log into Salesforce

![Authenticate to Salesforce](documentation/images/5-login.png)

Once authenticated, simply authorise the Salesforce CLI to enable you to make code deployments through Visual Studio Code.

![Authorise on Salesforce](documentation/images/6-authorize-cli.png)

If everything has worked correctly, you will get a toast message in Visual Studio Code telling you the authorisation was succesful.

![Authorise success message](documentation/images/7-look-for-success-message.PNG)

### Deploying the PanvivaSdk
Deployment is a multi-step process, we will need to deploy the Panviva SDK which is a dependency of the custom Salesforce components, and then we can deploy the components themselves.

In VS Code, open the file `force-app/main/default/classes/PanvivaSdk.cls` in the editor. From here, issue the command `SFDX: Deploy This Source to Org`.

![Deploy class](documentation/images/8-a-deploy-panviva-sdk-sfdx.png)

If the SDK has deployed correctly you will see the following success toast message

![SDK deployment success](documentation/images/8-b-deploy-panviva-sdk-confirmation.PNG)

### Deploying the components
With the SDK deployed, we can deploy the Salesforce components. Similar to the SDK, we need to open the corresponding file in the editor before deploying it. Open the file `force-app/main/default/lwc/quickAnswers/quickAnswers.js`. Issue the same command `SFDX: Deploy This Source to Org`

![Deploy component](documentation/images/9-deploy-quick-answers.png)

You should again get a success toast message

![Deploy component success](documentation/images/9-b-deploy-quick-answers-confirmation.PNG)

You must then repeat this process for the other component, for which you will need to open the file `force-app/main/default/lwc/searchPanviva/searchPanviva.js` in the editor

### Displaying the components

Now that the components have been deployed they can be displayed on any page within Salesforce. To do so, first enter "Edit Page"

![Salesforce Edit Page](documentation/images/10-a-deploy-to-page.png)

On the left side panel here you should be able to find the two new components that you deployed. Click **and Drag** this component and drop it where you want it to display.

![Salesforce Drag Component](documentation/images/11-drag-here.png)

Click Save. You will be presented with a popup window, from here you need to click "Assign as Org Default"

![Assign Component as Default in Org](documentation/images/12-assign-as-default-org.PNG)

You should now see the component rendering in the page. If you come across any errors, ensure that the values for your settings are correct.

![Rendered component](documentation/images/13-see-result.PNG)

You can now repeat the same steps to add the other component in to your SalesForce page.

# Gotchas

1. These project extracts the users Panviva username from the email in the User object. (i.e. for `johnsmith@company.org` will have the username `johnsmith` in Panviva)

2. Logging anything to the console in the LWCs will result in a `Proxy {}` object, to log the actual object you will need to perform `console.log(JSON.parse(JSON.stringify(object)))`.

3. The LWCs in this project handle/transform the API responses in the frontend. A possible optimisation is to modify PanvivaSdk.cls to do this instead, which may speed it up for high volume use cases.

4. When you call APEX methods from an LWC's controller, you don't have to provide all arguments. The APEX controller methods are built to provide default values for any arguments it can, but will fail relatively silently if you leave out an argument that can't be defaulted.
