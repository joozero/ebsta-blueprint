import { Stack, StackProps, Size, PhysicalName } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class EbstaBlueprintStack extends Stack {

  // variable
  private readonly cpuSize: number = 16384;
  private readonly memorySize: number = 32768;
  private readonly diskSize: number =100;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    
    // create Log Group
    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: PhysicalName.GENERATE_IF_NEEDED,
      retention: logs.RetentionDays.ONE_WEEK
    })

    // create ECS Cluster 
    const cluster = new ecs.Cluster(this,'ECSCluster', {
      clusterName: 'fargate-ebs-test',
      containerInsights: true,
    })

    ////////////////////////////////////////////
    // ECS/F with EBS 
    ////////////////////////////////////////////

    // create ECS Task Definition
    const ebsTaskDefinition = new ecs.FargateTaskDefinition(this, 'EBSTaskDef', {
      cpu: this.cpuSize,
      memoryLimitMiB: this.memorySize,
      family: 'ebs-fargate-task'
    });
    
    // configure container 
    const ebsContainer = ebsTaskDefinition.addContainer('EBSTaskContainer', {
      containerName: 'container',
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/joozero/fargate-fio'),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'ecs',
        logGroup: logGroup,
      })
    });
    
    // configure EBS Volume 
    const volume = new ecs.ServiceManagedVolume(this, 'EBSVolume', {
      name: 'ebs-task-volume',
      managedEBSVolume: {
        size: Size.gibibytes(this.diskSize),
        volumeType: ec2.EbsDeviceVolumeType.GP3,
        fileSystemType: ecs.FileSystemType.EXT4,
        iops: 15000,
        throughput: 500
      },
    });
    
    volume.mountIn(ebsContainer, {
      containerPath: '/mnt/ebs',
      readOnly: false,
    });
    
    ebsTaskDefinition.addVolume(volume);
    
    // create ECS service
    const ebsService = new ecs.FargateService(this, 'EBSFargateService', {
      cluster,
      taskDefinition: ebsTaskDefinition,
      serviceName: 'ebsta-service',
      enableExecuteCommand: true
    });

    ebsService.addVolume(volume);

    ////////////////////////////////////////////
    // ECS/F with no-EBS 
    ////////////////////////////////////////////

    // create ECS Task Definition
    const noEbsTaskDefinition = new ecs.FargateTaskDefinition(this, 'NoEBSTaskDef', {
      cpu: this.cpuSize,
      memoryLimitMiB: this.memorySize,
      family: 'no-ebs-fargate-task',
      ephemeralStorageGiB: this.diskSize
    });
    
    // configure container 
    noEbsTaskDefinition.addContainer('NoEBSTaskContainer', {
      containerName: 'container',
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/joozero/fargate-fio'),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'ecs',
        logGroup: logGroup,
      })
    });
    
    // create ECS service
    new ecs.FargateService(this, 'NoEBSFargateService', {
      cluster,
      taskDefinition: noEbsTaskDefinition,
      serviceName: 'no-ebsta-service',
      enableExecuteCommand: true
    });
  }
}
