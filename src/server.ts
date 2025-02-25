import mongoose from 'mongoose';
import app from './app';
import 'dotenv/config';
import config from './app/config';
import { Server } from 'http';

const port = config.port || 5000;
const database_url = config.database_url;
let server: Server;

async function main() {
  try {
    await mongoose.connect(database_url as string);

    server = app.listen(port, () => {
      console.log(`App Is Listening On Port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unhandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
