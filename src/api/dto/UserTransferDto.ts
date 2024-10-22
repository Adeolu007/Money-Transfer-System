export class UserTransferDto {
    id: string;
    amount: number;
    balance: number;
    status: string;
    transactionStatus: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(transfer: Partial<UserTransferDto>) {
        this.id = transfer.id!;
        this.amount = transfer.amount!;
        this.balance = transfer.balance!;
        this.status = transfer.status!;
        this.transactionStatus = transfer.transactionStatus!;
        this.createdAt = transfer.createdAt!;
        this.updatedAt = transfer.updatedAt!;
    }
}