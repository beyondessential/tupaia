import boto3
import re
import datetime

ec = boto3.client("ec2")
iam = boto3.client("iam")

# Deletes *all* snapshots that have a "DeleteOn" tag containing the current day formatted as
# YYYY-MM-DD. This function should be run at least daily.


def delete_old_snapshots(event):
    account_ids = list()
    try:
        account_ids.append(iam.get_user()["User"]["Arn"].split(":")[4])
    except Exception as e:
        # use the exception message to get the account ID the function executes under
        account_ids.append(re.search(r"(arn:aws:sts::)([0-9]+)", str(e)).groups()[1])

    delete_on = datetime.date.today().strftime("%Y-%m-%d")
    filters = [
        {"Name": "tag:DeleteOn", "Values": [delete_on]},
    ]
    snapshot_response = ec.describe_snapshots(OwnerIds=account_ids, Filters=filters)

    for snap in snapshot_response["Snapshots"]:
        ec.delete_snapshot(SnapshotId=snap["SnapshotId"])
