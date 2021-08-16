import {MediaPackage} from "@aws-sdk/client-mediapackage";
import {CloudWatchEvents} from "@aws-sdk/client-cloudwatch-events";
import {endTime, startTime, id, OriginEndpointId, S3Dest} from "./Input";

const mediapackage = new MediaPackage({region: "AKL"});
const cloudwatch = new CloudWatchEvents({region: "AKL"})
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
    Name: "Job Status",
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
    
};