import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import 'reflect-metadata'
import { Transaction } from './transactions';
import { v4 as uuidv4 } from 'uuid';

@Entity('users')  
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text', unique: true })
    email!: string;

    @Column({ type: 'text', unique: true })
    username!: string

    @Column({ type: 'text', select: false })
    password!: string;

    @Column({ type: 'text' })
    firstName!: string;

    @Column({ type: 'text' })
    lastName!: string;

    @Column({ type: 'numeric', default: 0 })
    accountBal!: number;

    @Column({ type: 'numeric' })
    accountNumber!: number;

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions!: Transaction[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;


    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }


    async comparePassword(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.password);
    }

    private validate() {
        if (this.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        if (!this.email.includes('@')) {
            throw new Error('Email must be valid');
        }

        if (!this.username) {
            throw new Error('Username cannot be empty');
        }

    }
}
