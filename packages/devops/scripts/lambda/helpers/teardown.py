import boto3
from helpers.networking import (
    build_record_set_deletion,
    delete_gateway,
    get_gateway_elb,
)
from helpers.utilities import get_tag

ec = boto3.client("ec2")
route53 = boto3.client("route53")
rds = boto3.client("rds")


def delete_route53_record_sets(deployment_name, record_set_deletions):
    # Filter out deletions for record sets that don't actually exist
    hosted_zone_id = route53.list_hosted_zones_by_name(DNSName="tupaia.org")[
        "HostedZones"
    ][0]["Id"]
    record_set_paginator = route53.get_paginator("list_resource_record_sets")
    record_set_response = record_set_paginator.paginate(
        HostedZoneId=hosted_zone_id
    ).build_full_result()
    all_record_sets = record_set_response["ResourceRecordSets"]
    all_record_set_names = [record_set["Name"] for record_set in all_record_sets]
    valid_record_set_deletions = [
        deletion
        for deletion in record_set_deletions
        if deletion["ResourceRecordSet"]["Name"] in all_record_set_names
    ]
    print("Generated {} record set changes".format(len(record_set_deletions)))
    if len(valid_record_set_deletions) > 0:
        route53.change_resource_record_sets(
            HostedZoneId=hosted_zone_id,
            ChangeBatch={
                "Comment": "Deleting subdomains for " + deployment_name,
                "Changes": valid_record_set_deletions,
            },
        )
        print("Submitted {} deletions to hosted zone".format(len(record_set_deletions)))


def terminate_instance(instance):
    # Release elastic ip
    public_ip_address = instance["PublicIpAddress"]
    elastic_ip = ec.describe_addresses(PublicIps=[public_ip_address])["Addresses"][0]
    ec.release_address(AllocationId=elastic_ip["AllocationId"])

    # Terminate ec2 instance (taking with it ebs)
    ec.terminate_instances(InstanceIds=[instance["InstanceId"]])


def teardown_instance(instance):
    # Check it's not protected
    protected = get_tag(instance, "Protected")
    if protected == "true":
        raise Exception(
            "The instance "
            + get_tag(instance, "Name")
            + " is protected and cannot be deleted"
        )

    # Get tagged details of instance
    deployment_type = get_tag(instance, "DeploymentType")
    deployment_name = get_tag(instance, "DeploymentName")

    # Build list of route53 entries to delete
    record_set_deletions = []

    # Delete DNS subdomains
    subdomains_via_dns = get_tag(instance, "SubdomainsViaDns")
    if subdomains_via_dns != "":
        public_dns_url = instance["PublicDnsName"]
        record_set_deletions = [
            build_record_set_deletion(
                "tupaia.org", subdomain, deployment_name, dns_url=public_dns_url
            )
            for subdomain in subdomains_via_dns.split(",")
        ]

    # Delete gateway subdomains
    subdomains_via_gateway = get_tag(instance, "SubdomainsViaGateway")
    if subdomains_via_gateway != "":
        gateway_elb = get_gateway_elb(deployment_type, deployment_name)
        record_set_deletions = record_set_deletions + [
            build_record_set_deletion(
                "tupaia.org", subdomain, deployment_name, gateway=gateway_elb
            )
            for subdomain in subdomains_via_gateway.split(",")
        ]

    delete_route53_record_sets(deployment_name, record_set_deletions)

    # Delete gateway
    if subdomains_via_gateway != "":
        delete_gateway(deployment_type, deployment_name)

    terminate_instance(instance)


def teardown_db_instance(deployment_name=None, deployment_type=None, db_id=None):
    if db_id:
        db_instance_id = db_id
    else:
        db_instance_id = deployment_type + "-" + deployment_name

    db_instance = rds.describe_db_instances(DBInstanceIdentifier=db_instance_id)
    db_instance_public_dns_url = db_instance["DBInstances"][0]["Endpoint"]["Address"]

    deleted_instance = rds.delete_db_instance(
        DBInstanceIdentifier=db_instance_id,
        SkipFinalSnapshot=True,
        DeleteAutomatedBackups=True,
    )
    print("Successfully deleted db instance: " + db_instance_id)

    record_set_deletions = [
        build_record_set_deletion(
            "tupaia.org", "db", deployment_name, dns_url=db_instance_public_dns_url
        )
    ]
    delete_route53_record_sets(deployment_name, record_set_deletions)

    return deleted_instance
