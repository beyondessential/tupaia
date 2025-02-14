import { AccessPolicy } from '@tupaia/access-policy';
import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';

const requiredParamsSchema = yup.object().shape({
  dataElementCodes: yup.array().of(yup.string().required()).default([]),
});

const configSchema = yup.object();

type DataElementMetadataDataTableServiceContext = {
  accessPolicy: AccessPolicy;
};
type DataElement = { code: string; name: string };

/**
 * DataTableService for pulling data from aggregator's fetchDataElements() endpoint
 */
export class DataElementMetadataDataTableService extends DataTableService<
  DataElementMetadataDataTableServiceContext,
  typeof requiredParamsSchema,
  typeof configSchema,
  DataElement
> {
  protected supportsAdditionalParams = false;

  public constructor(context: DataElementMetadataDataTableServiceContext, config: unknown) {
    super(context, requiredParamsSchema, configSchema, config);
  }

  protected async pullData(params: { dataElementCodes: string[] }) {
    const { dataElementCodes } = params;
    if (dataElementCodes.length === 0) {
      return [];
    }

    const aggregator = new Aggregator(
      new DataBroker({
        accessPolicy: this.ctx.accessPolicy,
      }),
    );

    const results = await aggregator.fetchDataElements(dataElementCodes, {
      includeOptions: true,
    });

    return results as DataElement[];
  }
}
