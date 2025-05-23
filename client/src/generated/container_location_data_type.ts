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
import { ContainerType as __ContainerType } from "./container_type_type";

export type ContainerLocationData = {
  containerType: __ContainerType,
  containerId: bigint,
  slotIndex: number,
};

/**
 * A namespace for generated helper functions.
 */
export namespace ContainerLocationData {
  /**
  * A function which returns this type represented as an AlgebraicType.
  * This function is derived from the AlgebraicType used to generate this type.
  */
  export function getTypeScriptAlgebraicType(): AlgebraicType {
    return AlgebraicType.createProductType([
      new ProductTypeElement("containerType", __ContainerType.getTypeScriptAlgebraicType()),
      new ProductTypeElement("containerId", AlgebraicType.createU64Type()),
      new ProductTypeElement("slotIndex", AlgebraicType.createU8Type()),
    ]);
  }

  export function serialize(writer: BinaryWriter, value: ContainerLocationData): void {
    ContainerLocationData.getTypeScriptAlgebraicType().serialize(writer, value);
  }

  export function deserialize(reader: BinaryReader): ContainerLocationData {
    return ContainerLocationData.getTypeScriptAlgebraicType().deserialize(reader);
  }

}


