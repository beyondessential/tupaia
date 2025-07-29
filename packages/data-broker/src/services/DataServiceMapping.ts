import { isEqual } from 'es-toolkit/compat';
import { DataSource, ServiceType } from '../types';

export type DataServiceMappingEntry = {
  dataSource: DataSource;
  service_type: ServiceType;
  config: Partial<{
    dhisInstanceCode: string;
    supersetChartId: number;
    supersetInstanceCode: string;
    supersetItemCode: string;
  }>;
};

export class DataServiceMapping {
  public dataElementMapping: DataServiceMappingEntry[];
  public dataGroupMapping: DataServiceMappingEntry[];
  public syncGroupMapping: DataServiceMappingEntry[];

  public constructor(
    dataElementMapping: DataServiceMappingEntry[] = [],
    dataGroupMapping: DataServiceMappingEntry[] = [],
    syncGroupMapping: DataServiceMappingEntry[] = [],
  ) {
    this.dataElementMapping = dataElementMapping;
    this.dataGroupMapping = dataGroupMapping;
    this.syncGroupMapping = syncGroupMapping;
  }

  public uniqueServiceTypes(): ServiceType[] {
    const set = new Set<ServiceType>();
    for (const deMapping of this.dataElementMapping) {
      set.add(deMapping.service_type);
    }
    for (const dgMapping of this.dataGroupMapping) {
      set.add(dgMapping.service_type);
    }
    for (const sgMapping of this.syncGroupMapping) {
      set.add(sgMapping.service_type);
    }
    return Array.from(set);
  }

  public dataSourcesByServiceType(): Record<ServiceType, DataSource[]> {
    const map = {} as Record<ServiceType, DataSource[]>;
    for (const serviceType of this.uniqueServiceTypes()) {
      map[serviceType] = [];
    }
    for (const deMapping of this.dataElementMapping) {
      map[deMapping.service_type].push(deMapping.dataSource);
    }
    for (const dgMapping of this.dataGroupMapping) {
      map[dgMapping.service_type].push(dgMapping.dataSource);
    }
    for (const sgMapping of this.syncGroupMapping) {
      map[sgMapping.service_type].push(sgMapping.dataSource);
    }
    return map;
  }

  public allMappings(): DataServiceMappingEntry[] {
    return [...this.dataElementMapping, ...this.dataGroupMapping, ...this.syncGroupMapping];
  }

  public mappingForDataSource(dataSource: DataSource): DataServiceMappingEntry | null {
    for (const mapping of this.allMappings()) {
      if (mapping.dataSource === dataSource) return mapping;
    }
    return null;
  }

  public equals(other: DataServiceMapping): boolean {
    if (this.dataElementMapping.length !== other.dataElementMapping.length) return false;
    if (this.dataGroupMapping.length !== other.dataGroupMapping.length) return false;
    for (let i = 0; i < this.dataElementMapping.length; i++) {
      const mA = this.dataElementMapping[i];
      const mB = other.dataElementMapping[i];
      if (mA.dataSource.code !== mB.dataSource.code) return false;
      if (mA.service_type != mB.service_type) return false;
      if (!isEqual(mA.config, mB.config)) return false;
    }
    for (let i = 0; i < this.dataGroupMapping.length; i++) {
      const mA = this.dataGroupMapping[i];
      const mB = other.dataGroupMapping[i];
      if (mA.dataSource.code !== mB.dataSource.code) return false;
      if (mA.service_type != mB.service_type) return false;
      if (!isEqual(mA.config, mB.config)) return false;
    }
    for (let i = 0; i < this.syncGroupMapping.length; i++) {
      const mA = this.syncGroupMapping[i];
      const mB = other.syncGroupMapping[i];
      if (mA.dataSource.code !== mB.dataSource.code) return false;
      if (mA.service_type != mB.service_type) return false;
    }
    return true;
  }
}
