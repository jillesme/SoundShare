module.exports = function ( type, url, params, content, headers ) {
    var request = new XMLHttpRequest();
    var deferred = Q.defer();

	var str = '';
    if( params ) {
		for (var key in params) {
		    if (str != "") {
		        str += '&';
		    }
		    str += key + '=' + params[key];
		}
    }

    request.open(type, url + str, true);

    if( headers ) {
        for( var i in headers ) {
            request.setRequestHeader(i, headers[i]);
        }
    }
    request.onload = onload;
    request.onerror = onerror;
    request.onprogress = onprogress;
    request.send(content || '');

    function onload() {
        if (request.status === 200) {
            var response;
            try {
                response = JSON.parse(request.responseText);
            } catch ( e ) {
                response = request.responseText;
            }

            deferred.resolve(response);
        } else {
            deferred.reject(new Error("Status code was " + request.status));
        }
    }

    function onerror() {
        deferred.reject(new Error("Can't XHR " + JSON.stringify(url)));
    }

    function onprogress(event) {
        deferred.notify(event.loaded / event.total);
    }

    return deferred.promise;
};