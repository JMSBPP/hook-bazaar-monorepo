import { Entity, PrimaryColumn, Index, Column } from "@subsquid/typeorm-store";

@Entity()
export class Protocol {
  constructor(props?: Partial<Protocol>) {
    Object.assign(this, props);
  }

  @PrimaryColumn()
  id!: string;

  @Index()
  @Column("bigint", { nullable: false })
  tokenId!: bigint;

  @Index()
  @Column("text", { nullable: false })
  protocolCaller!: string;

  @Index()
  @Column("text", { nullable: false })
  protocolAdminManager!: string;

  @Column("int", { nullable: false })
  block!: number;

  @Column("text", { nullable: false })
  txHash!: string;

  @Column("bigint", { nullable: false })
  timestamp!: bigint;
}

