import { TTransaction } from './transaction.interface';
import { Transaction } from './transaction.model';
import { User } from '../user/user.model';
import AppError from '../../errors/AppError';
import status from 'http-status';
import mongoose from 'mongoose';




const createDepositTransactionIntoDb = async (transaction: TTransaction) => {
    const { type, amount, recipientNumber, user } = transaction;

    const session = await mongoose.startSession(); // Start a session for transactions
    session.startTransaction(); // Start the transaction

    try {
        const admin = await User.findOne({ role: 'admin' }).session(session);
        if (!admin) throw new AppError(status.FORBIDDEN, 'Admin not found');

        // Ensure admin.totalMoney is initialized to 0 if it's undefined
        admin.totalMoney = admin.totalMoney || 0;

        const userData = await User.findById(user).session(session);
        const recipientData = await User.findOne({ phoneNumber: recipientNumber }).session(session);

        if (!userData) throw new AppError(status.NOT_FOUND, 'User not found');
        if (!recipientData) throw new AppError(status.NOT_FOUND, 'Recipient not found');
        if (!recipientData.isVerified) throw new AppError(status.FORBIDDEN, 'Recipient is not verified');
        if (recipientData.isBlocked) throw new AppError(status.FORBIDDEN, 'Recipient is blocked');
        if (recipientData.role !== 'user') throw new AppError(status.FORBIDDEN, 'This is not a user');
        if (recipientData.phoneNumber === userData?.phoneNumber) throw new AppError(status.FORBIDDEN, 'You cannot deposit to yourself');

        if (userData.balance < amount) throw new AppError(status.FORBIDDEN, 'Insufficient funds');

        if (type !== 'deposit') throw new AppError(status.BAD_REQUEST, 'Invalid transaction type');

        // Update balances
        recipientData.balance += amount;
        userData.balance -= amount;

        // Save user and recipient balances concurrently
        await Promise.all([
            recipientData.save({ session }),
            userData.save({ session }), // Save user's updated balance
        ]);

        // Create the transaction
        const createdTransaction = await Transaction.create([{
            ...transaction,
            recipient: recipientData._id,
        }], { session });

        // Populate the user and recipient in the newly created transaction
        const newTransaction = await createdTransaction[0].populate(['user', 'recipient']);

        await session.commitTransaction();
        return newTransaction; 
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession(); 
    }
};



const createTransferTransactionIntoDb = async (transaction: TTransaction) => {
    const { type, amount, user, recipientNumber } = transaction;

    const session = await mongoose.startSession(); 
    session.startTransaction(); // Start the transaction

    try {
        // Find admin
        const admin = await User.findOne({ role: 'admin' }).session(session);
        if (!admin) {
            throw new AppError(status.FORBIDDEN, 'Admin not found');
        }
        admin.balance = admin.balance || 0; // Ensure admin balance exists

        // Validate transaction type
        if (type !== 'transfer') {
            throw new AppError(status.BAD_REQUEST, 'Invalid transaction type');
        } else if (amount < 50) {
            throw new AppError(status.BAD_REQUEST, 'Transfer amount must be greater than 50');
        }

        // Find sender (user)
        const userData = await User.findById(user).session(session);
        if (!userData) {
            throw new AppError(status.NOT_FOUND, 'User not found');
        }

        // Find recipient (by phone number)
        const recipientData = await User.findOne({ phoneNumber: recipientNumber }).session(session);
        if (!recipientData) {
            throw new AppError(status.NOT_FOUND, 'Recipient not found');
        } else if (!recipientData.isVerified) {
            throw new AppError(status.FORBIDDEN, 'Recipient is not verified');
        } else if (recipientData.isBlocked) {
            throw new AppError(status.FORBIDDEN, 'Recipient is blocked');
        } else if (recipientData.role !== 'user') {
            throw new AppError(status.FORBIDDEN, 'This is not a user');
        } else if (recipientData.phoneNumber === userData.phoneNumber) {
            throw new AppError(status.FORBIDDEN, 'You cannot transfer to yourself');
        }

        // Check sender's balance
        const transferFee = amount >= 100 ? 5 : 0;
        if (userData.balance < amount + transferFee) {
            throw new AppError(status.BAD_REQUEST, 'Insufficient funds');
        }

        // Perform balance update
        userData.balance -= amount + transferFee;
        recipientData.balance += amount;
        admin.balance += transferFee;

        // Save user and recipient balances concurrently
        await Promise.all([
            userData.save({ session }),
            recipientData.save({ session }),
            admin.save({ session }),
        ]);

        // Create the transaction
        const createdTransaction = await Transaction.create([{
            ...transaction,
            recipient: recipientData._id,
        }], { session });

        // Populate the user and recipient in the newly created transaction
        const newTransaction = await createdTransaction[0].populate(['user', 'recipient'])

        await session.commitTransaction(); 
        return newTransaction; 
    } catch (error) {
        await session.abortTransaction(); 
        throw error;
    } finally {
        session.endSession(); // End the session
    }
};


const createWithdrawTransactionIntoDb = async (transaction: TTransaction) => {
    const { type, amount, user, agentNumber } = transaction;

    const session = await mongoose.startSession(); // Start a session for transactions
    session.startTransaction(); // Start the transaction

    try {
        // Find admin
        const admin = await User.findOne({ role: 'admin' }).session(session);
        if (!admin) throw new AppError(status.FORBIDDEN, 'Admin not found');

        admin.totalMoney = admin.totalMoney || 0;
        admin.balance = admin.balance || 0;

        if (type !== 'withdraw') {
            throw new AppError(status.BAD_REQUEST, 'Invalid transaction type');
        }

        // Find sender (user)
        const userData = await User.findById(user).session(session);
        if (!userData) throw new AppError(status.NOT_FOUND, 'User not found');

        // Find agent (recipient)
        const agentData = await User.findOne({ phoneNumber: agentNumber }).session(session);
        if (!agentData) throw new AppError(status.NOT_FOUND, 'Agent not found');
        if (!agentData.isVerified) throw new AppError(status.FORBIDDEN, 'Agent is not verified');
        if (agentData.isBlocked) throw new AppError(status.FORBIDDEN, 'Agent is blocked');
        if (agentData.role !== 'agent') throw new AppError(status.FORBIDDEN, 'This is not a Agent');
        if (agentData.phoneNumber === userData.phoneNumber) {
            throw new AppError(status.FORBIDDEN, 'You cannot withdraw to yourself');
        }
        if(amount > agentData.balance){
            throw new AppError(status.FORBIDDEN, 'Agent does not have sufficient amount');
        }

        // **Calculate Fees (1.5% total)**
        const withdrawFee = (amount * 1.5) / 100; // 1.5% of the amount
        const agentIncome = (amount * 1) / 100; // 1% goes to the agent
        const adminIncome = (amount * 0.5) / 100; // 0.5% goes to the admin

        if (userData.balance < amount + withdrawFee) {
            throw new AppError(status.BAD_REQUEST, 'Insufficient funds');
        }

        // **Perform Balance Updates**
        userData.balance -= amount + withdrawFee;
        agentData.balance -= amount; // reduce the amount from the agent
        agentData.income = (agentData.income || 0) + agentIncome; // Agent earns 1%
        admin.balance += adminIncome; // Admin earns 0.5%
        admin.totalMoney -= amount; // System total money update

        // Save user, agent, and admin balances concurrently
        await Promise.all([
            userData.save({ session }),
            agentData.save({ session }),
            admin.save({ session }),
        ]);

        // **Create Transaction**
        const createdTransaction = await Transaction.create(
            [
                {
                    ...transaction,
                    agentId: agentData._id,
                }
            ],
            { session }
        );

        // **Populate the user and agent in the newly created transaction**
        const newTransaction = await createdTransaction[0].populate(['user', 'agentId']);

        await session.commitTransaction();
        return newTransaction;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession(); // End the session
    }
};








export const transactionServices = {
  createDepositTransactionIntoDb,
  createTransferTransactionIntoDb,
  createWithdrawTransactionIntoDb,
};
