export class TransferResponseDto {
    msg: string;
    transaction: {
        id: number;
        amount: number;
        balance: number;
        status: string;
        transactionStatus: string;
        accountNumber: string;
        name: string;
    };

    constructor(msg: string, transaction: Partial<TransferResponseDto['transaction']>) {
        this.msg = msg;
        this.transaction = {
            id: transaction.id!,
            amount: transaction.amount!,
            balance: transaction.balance!,
            status: transaction.status!,
            transactionStatus: transaction.transactionStatus!,
            accountNumber: transaction.accountNumber!,
            name: transaction.name!,
        };
    }
}
