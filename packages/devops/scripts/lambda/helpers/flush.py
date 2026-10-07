import time

import boto3

ssm = boto3.client("ssm")

FLUSH_SCRIPT = "/home/ubuntu/tupaia/packages/devops/scripts/deployment-aws/flushToS3.sh"


def flush_instance_state(instance, timeout_seconds=180):
    """
    Asks a server that is about to be replaced to upload its Munin history and logs to S3, so its
    replacement restores the latest Munin data and the logs outlive it. Best effort: a server that
    is stopped, predates the flush script or has no SSM agent is replaced all the same.
    """
    instance_id = instance["InstanceId"]
    if instance["State"]["Name"] != "running":
        print(f"Not flushing {instance_id}: it isn't running")
        return

    try:
        command_id = ssm.send_command(
            InstanceIds=[instance_id],
            DocumentName="AWS-RunShellScript",
            Comment="Flush Munin and logs before replacement",
            Parameters={
                "commands": [f"if [ -x {FLUSH_SCRIPT} ]; then {FLUSH_SCRIPT}; fi"]
            },
            TimeoutSeconds=timeout_seconds,
        )["Command"]["CommandId"]
    except Exception as e:
        print(f"Not flushing {instance_id}: {e}")
        return

    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        time.sleep(5)
        try:
            invocation = ssm.get_command_invocation(
                CommandId=command_id, InstanceId=instance_id
            )
        except ssm.exceptions.InvocationDoesNotExist:
            continue
        if invocation["Status"] not in ("Pending", "InProgress", "Delayed"):
            print(f"Flush of {instance_id} finished: {invocation['Status']}")
            return
    print(
        f"Flush of {instance_id} still running after {timeout_seconds} s; carrying on"
    )
