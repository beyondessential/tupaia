import { AccessPolicy } from '@tupaia/access-policy';
import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { upperFirst, yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';

const requiredParamsSchema = yup.object().shape({
  dataGroupCode: yup.string().required(),
});

const configSchema = yup.object();

type DataGroupMetaDataDataTableServiceContext = {
  accessPolicy: AccessPolicy;
};
type DataGroup = {
  code: string;
  name: string;
  dataElements: { code: string; name: string; text: string; options: Record<string, unknown>[] }[];
};

type DataElementMetadataWithDataGroupMetadata = {
  dataGroupCode: string;
  dataGroupName: string;
  dataElementCode: string;
  dataElementName: string;
  [key: string]: unknown;
};

/**
 * DataTableService for pulling data from aggregator's fetchDataGroup() endpoint
 */
export class DataGroupMetaDataDataTableService extends DataTableService<
  DataGroupMetaDataDataTableServiceContext,
  typeof requiredParamsSchema,
  typeof configSchema,
  DataElementMetadataWithDataGroupMetadata
> {
  protected supportsAdditionalParams = false;

  public constructor(context: DataGroupMetaDataDataTableServiceContext, config: unknown) {
    super(context, requiredParamsSchema, configSchema, config);
  }

  protected async pullData(params: { dataGroupCode: string }) {
    const { dataGroupCode } = params;

    const aggregator = new Aggregator(
      new DataBroker({
        accessPolicy: this.ctx.accessPolicy,
      }),
    );

    const results: DataGroup = await aggregator.fetchDataGroup(dataGroupCode, {
      includeOptions: true,
    });
    const { code: newDataGroupCode, name: dataGroupName, dataElements } = results;

    return dataElements.map(
      ({ code: dataElementCode, name: dataElementName, ...restOfConfigs }) => {
        const restOfConfigsWithDataElementPrefix = Object.fromEntries(
          Object.entries(restOfConfigs).map(([key, value]) => [
            `dataElement${upperFirst(key)}`,
            value,
          ]),
        );

        return {
          dataGroupCode: newDataGroupCode,
          dataGroupName,
          dataElementCode,
          dataElementName,
          ...restOfConfigsWithDataElementPrefix,
        };
      },
    );
  }
}
