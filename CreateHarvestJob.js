import {MediaPackage} from "@aws-sdk/client-mediapackage";
import {CloudWatchEvents} from "@aws-sdk/client-cloudwatch-events";
import {harvest_info, aws_account} from "./Input";

const mediapackage = new MediaPackage({region: "ap-southeast-2"});
const cloudwatch = new CloudWatchEvents({region: "ap-southeast-2"})
var harvestJobId;
var harvestJobStatus;
var ruleARN;

var MPparams = {                                                         //paramaeters for Harvest Job
    EndTime: harvest_info.endTime,
    Id: harvest_info.id,
    OriginEndpointId: harvest_info.originEndpointId,
    S3Destination: harvest_info.S3Dest,
    StartTime: harvest_info.startTime
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
        "account": aws_account,
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