import mongoose from "mongoose";
mongoose.Promise = global.Promise;

export function startMongoose(): void {
  mongoose
    .connect(`${process.env.URI_MONGODB}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      /* eslint-disable no-console */
      console.log("Conectada");
    })
    .catch(err => {
      console.log("Error al conectar: ", err);
    });
}
