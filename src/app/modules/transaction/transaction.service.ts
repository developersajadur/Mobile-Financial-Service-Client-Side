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

        if (!recipientData) throw new AppError(status.NOT_FOUND, 'Recipient not found');
        if (!recipientData.isVerified) throw new AppError(status.FORBIDDEN, 'Recipient is not verified');
        if (recipientData.isBlocked) throw new AppError(status.FORBIDDEN, 'Recipient is blocked');
        if (recipientData.role !== 'user') throw new AppError(status.FORBIDDEN, 'This is not a user');
        if (recipientData.phoneNumber === userData?.phoneNumber) throw new AppError(status.FORBIDDEN, 'You cannot deposit to yourself');

        if (type !== 'deposit') throw new AppError(status.BAD_REQUEST, 'Invalid transaction type');

        // Update balances
        recipientData.balance += amount;
        admin.totalMoney += amount; 

        // Save user and recipient balances concurrently
        await Promise.all([
            recipientData.save({ session }),
            admin.save({ session }), // Save admin's updated balance
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






export const transactionServices = {
  createDepositTransactionIntoDb,
  createTransferTransactionIntoDb,
};
