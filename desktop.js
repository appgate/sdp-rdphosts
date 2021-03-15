/**
 * The script assumes a claim called claims.user.desktopsFromAd, 
*  an array type.
*
*  1. Map AD attribute <defined in your AD> {multiple values} --> claims.user.desktopsFromAd []string
*  2. Use the script.
*  2.1 Selects the candidates which are in rdPlatforms list.
*  2.2 Extracts the hostname (CN) and adds domain suffix.
*  2.3 Return the list of all candidates which had a hostname.
*/


// Helper vars ----------------------------------
// Note on performance: do not set debugLog log to true in production. Also, keep the auditlog as 
// spares as possible.
var audit = false; // prints audit messages
var debug = false; //prints debugLog messages
var dryRun = false; // run without any available claim.
var logPrefix = "rdp-script";
var hostList = [];

// Utils ----------------------------------------
function log(msg) {
    if (audit) {
        auditLog(prefix + ": " + msg);
    }
}


// log to console log
function debugLog(msg) {
    if (debug) {
        console.log("debugLog: " + msg);
    }
}

// Script vars ----------------------------------
var domainSuffix = ".appgate.lab";
var rdpPlatforms = ["Desktops",
    "Developer",
    "Laptops",
    "Tablets",
    "Virtual"
];
var input;
if (dryRun) {
    var fakeClaim = ""
    input = fakeClaim;
} else {
    if (!claims.user.desktopsFromAd) {
        // claim is not defined
        return []
    }
    // dumb test if an instantiated array
    try {
        var test = claims.user.desktopsFromAd[0]
    } catch (err) {
        return []
    }
    input = claims.user.desktopsFromAd;
}
debugLog("input -->" + input);


/// Logic
var candidates = []
// select the ones which are in rdpPlatforms
for (var k = 0; k < input.length; k++) {
    // is in platform list
    for (var l = 0; l < rdpPlatforms.length; l++) {
        if (input[k].toLowerCase().indexOf(rdpPlatforms[l].toLowerCase()) > -1) {
            candidates.push(input[k])
            debugLog("candidate: " + input[k] + ", type: " + rdpPlatforms[l])
            break
        }
    }
}
var hostNames = []
// get the host names, use dumb iteration
for (var k = 0; k < candidates.length; k++) {
    var t1 = candidates[k].split(",")
    for (var h = 0; h < t1.length; h++) {
        if (t1[h].indexOf("CN=") > -1) {
            var hostname = t1[h].split("CN=")[1].replace(",", "")
            hostNames.push(hostname + domainSuffix)
            break
        }
    }
}
debugLog("host names: " + hostNames)

return hostNames
