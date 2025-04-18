// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN YOUR MODULE SOURCE CODE INSTEAD.

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
import {
  AlgebraicType,
  AlgebraicValue,
  BinaryReader,
  BinaryWriter,
  CallReducerFlags,
  ConnectionId,
  DbConnectionBuilder,
  DbConnectionImpl,
  DbContext,
  ErrorContextInterface,
  Event,
  EventContextInterface,
  Identity,
  ProductType,
  ProductTypeElement,
  ReducerEventContextInterface,
  SubscriptionBuilderImpl,
  SubscriptionEventContextInterface,
  SumType,
  SumTypeVariant,
  TableCache,
  TimeDuration,
  Timestamp,
  deepEqual,
} from "@clockworklabs/spacetimedb-sdk";
export type InventoryItem = {
  instanceId: bigint,
  playerIdentity: Identity,
  itemDefId: bigint,
  quantity: number,
  hotbarSlot: number | undefined,
  inventorySlot: number | undefined,
};

/**
 * A namespace for generated helper functions.
 */
export namespace InventoryItem {
  /**
  * A function which returns this type represented as an AlgebraicType.
  * This function is derived from the AlgebraicType used to generate this type.
  */
  export function getTypeScriptAlgebraicType(): AlgebraicType {
    return AlgebraicType.createProductType([
      new ProductTypeElement("instanceId", AlgebraicType.createU64Type()),
      new ProductTypeElement("playerIdentity", AlgebraicType.createIdentityType()),
      new ProductTypeElement("itemDefId", AlgebraicType.createU64Type()),
      new ProductTypeElement("quantity", AlgebraicType.createU32Type()),
      new ProductTypeElement("hotbarSlot", AlgebraicType.createOptionType(AlgebraicType.createU8Type())),
      new ProductTypeElement("inventorySlot", AlgebraicType.createOptionType(AlgebraicType.createU16Type())),
    ]);
  }

  export function serialize(writer: BinaryWriter, value: InventoryItem): void {
    InventoryItem.getTypeScriptAlgebraicType().serialize(writer, value);
  }

  export function deserialize(reader: BinaryReader): InventoryItem {
    return InventoryItem.getTypeScriptAlgebraicType().deserialize(reader);
  }

}


