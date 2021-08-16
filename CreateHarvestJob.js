import {MediaPackage} from "@aws-sdk/client-mediapackage";
import {CloudWatchEvents} from "@aws-sdk/client-cloudwatch-events";
import {endTime, startTime, id, originEndpointId, S3Dest} from "./Input";

const mediapackage = new MediaPackage({region: "ap-southeast-2"});
const cloudwatch = new CloudWatchEvents({region: "ap-southeast-2"})
var harvestJobId;
var harvestJobStatus;
var ruleARN;

var MPparams = {                                                         //paramaeters for Harvest Job
    EndTime: endTime,
    Id: id,
    OriginEndpointId: originEndpointId,
    S3Destination: S3Dest,
    StartTime: startTime
};
 
mediapackage.createHarvestJob(MPparams, function(err,data){
    if (err) console.log(err.stack);                                    //list error stack
    else harvestJobId = data.Id, harvestJobStatus = data.Status;        //store job id and status
});

var CWparams = {
    Name: "JOB NAME",
    EventPattern: {
        "detail-type": "MediaPackage HarvestJob Notification",
        "source": "aws.mediapackage",
        "account": "THE CUSTOMER AWS ACCOUNT ID",
        "region": "ap-southeast-2",
        "detail":{
           "harvest_job": {
               "status": "SUCCEEDED",
           }
        }},
    Tags: [{
        Key: "Job",
        Value: "Status"  
    }]    
};

cloudwatch.putRule(CWparams, function(err,data){
    if (err) console.log(err.stack);                                    //list error stack
    else ruleARN = data.RuleARN;                                        //store rule ARN
});

var PTparams = {
    Rule: "JOB NAME",
    Targets: [ 
        {
        Arn: 'TARGET ARN', 
        Id: 'UNIQUE TARGET ID', 
        RoleArn: S3Dest.roleARn
        },
    ]
};

cloudwatch.putTargets(PTparams, function(err, data) {
    if (err) console.log(err, err.stack); 
    else     console.log(data); 
});