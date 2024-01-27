# ECS Blueprint for attaching Amazon EBS Volumes to Amazon ECS Tasks

Customer can provision Amazon EBS storage for your ECS tasks running on Amazon EC2 and AWS Fargate by using ECS APIs. This feature makes it easier for you to deploy storage and data intensive application like ETL jobs, media transcoding and ML inference. Unlike ephemeral storage, you can choose volume’s type, performance, can restore from snapshot or can optionally preserve the volume. 

## How to start

- set your account and region into `/bin/ebsta-blueprint.ts`
    ```
    # /bin/ebsta-blueprint.ts
    const env = { account: '111111111111', region: 'us-west-2' };
    ```

- if you want to change resource amount such as CPU, Memory, and Volume, change the value placed in `variable section`
    ```
    # /lib/ebsta-blueprint-stack.ts
    # variable
    private readonly cpuSize: number = 16384;
    private readonly memorySize: number = 32768;
    private readonly diskSize: number =100;

    ```

- use the `cdk bootstrap` command to install the bootstrap stack into an environment if it is necessary 
    ```
    cdk bootstrap
    ```

- use `cdk deploy` to deploy a ECS application
    ```
    cdk deploy
    ```

- This container image already includes [`Flexible I/O tester (FIO)`](https://fio.readthedocs.io/en/latest/), you can do performance test by accessing into the shell with `ecs exec` like below. You can compare performance between `ebsta-service` and `no-ebsta-service`.

    ```
    aws ecs execute-command --cluster fargate-ebs-test \
    --task <<PUT YOUR TASK ID>> \
    --container container \
    --interactive --command "/bin/sh" --region <<REGION>>
    ```

## Reference 

- [Amazon ECS and AWS Fargate now integrate with Amazon EBS](https://aws.amazon.com/about-aws/whats-new/2024/01/amazon-ecs-fargate-integrate-ebs/)
- [Amazon ECS supports a native integration with Amazon EBS volumes for data-intensive workloads](https://aws.amazon.com/blogs/aws/amazon-ecs-supports-a-native-integration-with-amazon-ebs-volumes-for-data-intensive-workloads/)
