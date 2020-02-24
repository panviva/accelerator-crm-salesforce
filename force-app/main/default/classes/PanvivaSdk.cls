public with sharing class PanvivaSdk {
    private static Pv_Api_Settings__c settings = Pv_Api_Settings__c.getOrgDefaults();

    @AuraEnabled
    public static void liveSearch(String username, String query, Boolean showFirstResult, Boolean maximizeClient) {
        String body, endpoint;

        endpoint = 'operations/live/search/';

        body = JSON.serialize(
            new Map<String, Object> {
                'username' => existsOrThrow(username, 'The liveSearch API requires a username'),
                'query' => existsOrThrow(query, 'The liveSearch API requires a query string'), 
                'showFirstResult' => showFirstResult != null ? showFirstResult : false,
                'maximizeClient' => maximizeClient != null ? maximizeClient : true
            }
        );

        makePostRequest(endpoint, body);
    }

    @AuraEnabled
    public static void liveCsh(String username, String query, Boolean showFirstResult, Boolean maximizeClient) {      
        String body, endpoint;

        endpoint = 'operations/live/csh/';

        body = JSON.serialize(
            new Map<String, Object> {
                'username' => existsOrThrow(username, 'The liveCsh API requires a username'),
                'query' => existsOrThrow(query, 'The liveCsh API requires a query string'), 
                'showFirstResult' => showFirstResult != null ? showFirstResult : false,
                'maximizeClient' => maximizeClient != null ? maximizeClient : true
            }
        );
        makePostRequest(endpoint, body);
    }

    @AuraEnabled
    public static void liveDocument(String username, String documentId, String location, Boolean maximizeClient) {
        String body, endpoint;

        endpoint = 'operations/live/document/';

        body = JSON.serialize(
            new Map<String, Object> {
                'username' => existsOrThrow(username, 'The liveDocument API requires a username'),
                'id' => existsOrThrow(documentId, 'The liveDocument API requires a document id'), 
                'location' => String.isBlank(location) ? '0' : location,
                'maximizeClient' => maximizeClient != null ? maximizeClient : true
            }
        );

        makePostRequest(endpoint, body);
    }

    @AuraEnabled
    public static String getDocument(String documentId, String version) {
        String endpoint = 'resources/document/';
        return makeGetRequest(endpoint + documentId + '?' + version);
    }

    @AuraEnabled
    public static String getArtefact(String id) {
        String endpoint = 'resources/artefact/';
        return makeGetRequest(endpoint + id);
    }

    @AuraEnabled
    public static String documentSearch(String term, String pageOffset, String pageLimit) {
        String endpoint = 'operations/search/';
        term = existsOrThrow(term, 'The documentSearch API requires a search term');

        String call = endpoint + '?term=' + EncodingUtil.URLENCODE(term,'UTF-8');

        if (String.isNotBlank(pageOffset)) {
            call += '&pageOffset=' + EncodingUtil.URLENCODE(pageOffset,'UTF-8');
        }
        if (String.isNotBlank(pageLimit)) {
            call += '&pageLimit=' + EncodingUtil.URLENCODE(pageLimit,'UTF-8');
        }

        return makeGetRequest(call);
    }

    @AuraEnabled
    public static String artefactSearch(String simplequery, String advancedquery, String filter, String channel, String pageOffset, String pageLimit) {
        Boolean bothQueriesSet = String.isNotBlank(simplequery) && String.isNotBlank(advancedquery);
        Boolean noQuerySet = String.isBlank(simplequery) && String.isBlank(advancedquery);

        // exactly one of either simple or advanced query must be set
        if (bothQueriesSet) {
            throw new AuraHandledException('The artefactSearch API cannot take both simple and advanced queries at once');
        }
        if (noQuerySet) {
            throw new AuraHandledException('The artefactSearch API requires either a simple or advanced query');
        }

        String endpoint = 'operations/artefact/nls/';
        
        String call = endpoint;

        if (String.isNotBlank(simplequery)) {
            call += '?simplequery=' + EncodingUtil.URLENCODE(simplequery,'UTF-8');
        } else if (String.isNotBlank(advancedquery)) {
            call += '?advancedquery=' + EncodingUtil.URLENCODE(advancedquery,'UTF-8');
        }
        
        if (String.isNotBlank(filter)) {
            call += '&filter=' + EncodingUtil.URLENCODE(filter,'UTF-8');
        }
        if (String.isNotBlank(channel)) {
            call += '&channel=' + EncodingUtil.URLENCODE(channel,'UTF-8');
        }
        if (String.isNotBlank(pageOffset)) {
            call += '&pageOffset=' + EncodingUtil.URLENCODE(pageOffset,'UTF-8');
        }
        if (String.isNotBlank(pageLimit)) {
            call += '&pageLimit=' + EncodingUtil.URLENCODE(pageLimit,'UTF-8');
        }

        return makeGetRequest(call);
    }

    private static String makePostRequest(String endpoint, String body) {

        HttpRequest req = new HttpRequest();

        //Set HTTPRequest Method
        req.setMethod('POST');

        //Set HTTPRequest header properties
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('Accept', 'application/json');
        req.setHeader('Ocp-Apim-Subscription-Key', settings.Ocp_Apim_Subscription_Key__c);
        req.setEndpoint(settings.Base_URL__c + endpoint);

        //Set the HTTPRequest body
        req.setBody(body);
        Http http = new Http();
        HTTPResponse res;

        try {
            //Execute web service call here
            res = http.send(req);
            if (res.getStatusCode() != 202) {
                throw new AuraHandledException('received HTTP response ' + res.getStatusCode());
            }
        } catch (System.CalloutException e) {
            System.debug(e);
        }

        return res.getBody();
    }

    private static String makeGetRequest(String endpoint) {

        HttpRequest req = new HttpRequest();

        //Set HTTPRequest Method
        req.setMethod('GET');

        //Set HTTPRequest header properties
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('Accept', 'application/json');
        req.setHeader('Ocp-Apim-Subscription-Key', settings.Ocp_Apim_Subscription_Key__c);
        req.setEndpoint(settings.Base_URL__c + endpoint);

        Http http = new Http();
        HTTPResponse res;
        
        try {
            //Execute web service call here
            res = http.send(req);
            if (res.getStatusCode() != 200 && res.getStatusCode() != 202) {
                throw new AuraHandledException('received HTTP response ' + res.getStatusCode());
            }
        } catch (System.CalloutException e) {
            System.debug(e);
        }
        
        return res.getBody();
    }

    private static String existsOrThrow(String toValidate, String errorMessage) {
        Boolean valid = true;

        if (toValidate == null || String.isBlank(toValidate)) {
            throw new AuraHandledException(errorMessage);
        }

        return toValidate;
    }
}