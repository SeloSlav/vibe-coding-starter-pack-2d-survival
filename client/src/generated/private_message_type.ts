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
export type PrivateMessage = {
  id: bigint,
  recipientIdentity: Identity,
  senderDisplayName: string,
  text: string,
  sent: Timestamp,
};

/**
 * A namespace for generated helper functions.
 */
export namespace PrivateMessage {
  /**
  * A function which returns this type represented as an AlgebraicType.
  * This function is derived from the AlgebraicType used to generate this type.
  */
  export function getTypeScriptAlgebraicType(): AlgebraicType {
    return AlgebraicType.createProductType([
      new ProductTypeElement("id", AlgebraicType.createU64Type()),
      new ProductTypeElement("recipientIdentity", AlgebraicType.createIdentityType()),
      new ProductTypeElement("senderDisplayName", AlgebraicType.createStringType()),
      new ProductTypeElement("text", AlgebraicType.createStringType()),
      new ProductTypeElement("sent", AlgebraicType.createTimestampType()),
    ]);
  }

  export function serialize(writer: BinaryWriter, value: PrivateMessage): void {
    PrivateMessage.getTypeScriptAlgebraicType().serialize(writer, value);
  }

  export function deserialize(reader: BinaryReader): PrivateMessage {
    return PrivateMessage.getTypeScriptAlgebraicType().deserialize(reader);
  }

}


