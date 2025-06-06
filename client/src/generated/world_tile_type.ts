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
import { TileType as __TileType } from "./tile_type_type";

export type WorldTile = {
  id: bigint,
  chunkX: number,
  chunkY: number,
  tileX: number,
  tileY: number,
  worldX: number,
  worldY: number,
  tileType: __TileType,
  variant: number,
  biomeData: string | undefined,
};

/**
 * A namespace for generated helper functions.
 */
export namespace WorldTile {
  /**
  * A function which returns this type represented as an AlgebraicType.
  * This function is derived from the AlgebraicType used to generate this type.
  */
  export function getTypeScriptAlgebraicType(): AlgebraicType {
    return AlgebraicType.createProductType([
      new ProductTypeElement("id", AlgebraicType.createU64Type()),
      new ProductTypeElement("chunkX", AlgebraicType.createI32Type()),
      new ProductTypeElement("chunkY", AlgebraicType.createI32Type()),
      new ProductTypeElement("tileX", AlgebraicType.createI32Type()),
      new ProductTypeElement("tileY", AlgebraicType.createI32Type()),
      new ProductTypeElement("worldX", AlgebraicType.createI32Type()),
      new ProductTypeElement("worldY", AlgebraicType.createI32Type()),
      new ProductTypeElement("tileType", __TileType.getTypeScriptAlgebraicType()),
      new ProductTypeElement("variant", AlgebraicType.createU8Type()),
      new ProductTypeElement("biomeData", AlgebraicType.createOptionType(AlgebraicType.createStringType())),
    ]);
  }

  export function serialize(writer: BinaryWriter, value: WorldTile): void {
    WorldTile.getTypeScriptAlgebraicType().serialize(writer, value);
  }

  export function deserialize(reader: BinaryReader): WorldTile {
    return WorldTile.getTypeScriptAlgebraicType().deserialize(reader);
  }

}


