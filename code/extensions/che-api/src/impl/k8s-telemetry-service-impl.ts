/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/

import {
    EventProperty,
    TelemetryClient,
} from "@eclipse-che/workspace-telemetry-client";

import { TelemetryService } from "../api/telemetry-service";
import { injectable } from "inversify";

@injectable()
export class K8sTelemetryServiceImpl implements TelemetryService {
    private readonly telemetryClient: TelemetryClient | undefined;

    constructor() {
        if (process.env.DEVWORKSPACE_TELEMETRY_BACKEND_PORT === undefined) {
            console.error(
                'Unable to create telemetry client: "DEVWORKSPACE_TELEMETRY_BACKEND_PORT" is not set.'
            );
        } else {
            this.telemetryClient = new TelemetryClient(
                undefined,
                "http://localhost:" + process.env.DEVWORKSPACE_TELEMETRY_BACKEND_PORT
            );
        }
    }

    async submitTelemetryEvent(
        id: string,
        ownerId: string,
        ip: string,
        agent: string,
        resolution: string,
        properties: [string, string][]
    ): Promise<void> {
        if (!this.telemetryClient) {
            return;
        }

        await this.telemetryClient.event({
            id: id,
            ip: ip,
            ownerId: ownerId,
            agent: agent,
            resolution: resolution,
            properties: properties.map((prop: [string, string]) => {
                const eventProp: EventProperty = {
                    id: prop[0],
                    value: prop[1],
                };
                return eventProp;
            }),
        });
    }

    async submitTelemetryActivity(): Promise<void> {
        if (!this.telemetryClient) {
            return;
        }
        await this.telemetryClient.activity();
    }
}
