import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user'; 

@Entity('transactions')  
export class Transaction {
    @PrimaryGeneratedColumn()  
    id!: number;

    @ManyToOne(() => User, (user) => user.transactions)
    user!: User;

    @Column({ type: 'varchar', length: 255 })
    status!: string;

    @Column({ type: 'numeric' })  
    amount!: number;

    @Column({ type: 'numeric' })  
    balance!: number;

    @Column({ type: 'varchar', length: 255 })  
    transactionStatus!: string;

    @Column({ type: 'varchar', length: 255 }) 
    accountNumber!: string;

    @Column({ type: 'varchar', length: 255 }) 
    name!: string;

    @Column()
    userId!: number;

    @CreateDateColumn()  
    createdAt!: Date;

    @UpdateDateColumn()  
    updatedAt!: Date;
}
