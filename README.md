# Use case
Organisation admins commonly have the need to access their desktop machine from remote, mostly with a RDP client. The desktop machines are fixed installed, so they cannot be moved. The access to their individual machines must be managed since machine and user are tied to each other, we use Acitve Directory for this:
1. The user authenticates himself torwards AD with the Appgate client.
2. The AD response contains information about their personal machine.
4. The user has the requirements to: qualify for the policy, then needs to have published hostnames in an AD attribute.
3. The user will be given access to the machines defined in the attribute.


## Concept: entitlement scripts
This will require a setup as the following:

### Map an attribute containing the host `claims.user.desktopsFromAd`
Here we assume you have an attribute available in AD. Now, you need to map it, which means tell Appgate to create a claim with its value. A claim can be used within different functions in Appgate as a variable. Here we will use it in the entitlement script to generate a llist with host-names. The claims are inthe context of a user session. 

Identity Provider > Map Attributes to User Claims >
* Attribute: _the name of AD attribute_
* Claim name: _desktopsFromAD_

You can test the mapping if it works properly: Identity Provider > AD > Test user (Icon to the right).

### Policy: `Admin Personal RDP`
The policy assigns users to entitlements. Here we need to decide what users should be assigned the policy. As the name hints, this is meant for administrators. For this case we can use a `admin` AD-Group to map the polcy to the users who are admins.

### An Entitlement `Admin RDP from AD`
The entitlent defines the access rule. Here we have simple setup and need only one action:
* Rule: _Allow_
* Protocol: _tcp up_
* ports: _3389_
* Network Resources (target): _*script://desktop*_

Assign the entitlement to the policy.

### Entitlement script

* the script: [desktop.js](desktop.js)

The entitlement script is a JavaScript that is executed when the entitlement is instantiated on the Gateway. It _must_ return an array of host names IP adresses. Example of possible return values:

```javascript
var hosts = ['click.ad.packnot.com, 
             '192.112.12.0',
             '172.16.0.0/16'];
```
An empty array `[]` is the default. Any un-catched error or wrong format/data is regarded as empty.

The entitlement script `desktop.js` will parse the claim which stores the users, and format it so it returns an array of host(s). In the script you can set it `dryRun=true` run the script locally (on your machine) to follow the steps. 

Add the entitlement script: Scripts > Entitlement Scripts > Add New: name it to `desktop`.

### Testing
If you want to test it, you will need to use hostnames that the Gateway can properly resolve to IP adresses otherwise the entitlement will be empty. You can also use IP adresses instead, for testing purposes.

Once a user with such policy is assigned, you can check the session details for that person on the appliance/gateway the entitlement is active. The session detail will reveal if the entitlement script has returned any value or not for the entitlement. It also displays the claims, the AD mappings etc.

#### Debug log
The debug log prints information to understand the code does what it should, or to help during trouble shooting. Those logs end up in the appliance logs, so in `journal` but also in `/var/log/syslog`. The messages are prefixed with a name, so it will be easy to identify the messages. Debug logs will not show up in the Audit Log.

Turn this off when you are in production, it can fill the disk.

#### Audit Log
Audit log allows you to ingest important messages to the audit log. Those can be for example 'user X granted access to <list of hosts>'. Those messages are targeted for a SIEM or Audit Trace.

