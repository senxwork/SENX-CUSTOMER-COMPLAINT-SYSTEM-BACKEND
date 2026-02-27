/* eslint-disable prettier/prettier */
import { EntityRepository, Repository } from 'typeorm';
import { ComplaintTransaction } from './complaint-transaction.entity';


@EntityRepository(ComplaintTransaction)
export class ComplaintTransactionRepository extends Repository<ComplaintTransaction> {


}
