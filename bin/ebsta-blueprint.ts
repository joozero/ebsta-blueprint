#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EbstaBlueprintStack } from '../lib/ebsta-blueprint-stack';

const app = new cdk.App();

// put account, region info
const env = { account: '111111111111', region: 'us-west-2' };

new EbstaBlueprintStack(app, 'EbstaBlueprintStack', { env: env });
