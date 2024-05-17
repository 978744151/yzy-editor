/**
 * 查询实体
 */
export interface QueryEntity {
  entityId: string
  tableName: string
  tableNameLabel?: string
  showName?: string
  relType?: string
  columns: any[]
  children?: QueryEntity[]
}
