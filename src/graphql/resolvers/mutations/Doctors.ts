import { Doctor } from "../../../database";
import faker, { lorem } from "faker";

interface CreateDoctorArgs {
  doctor: {
    name: string;
    lastname: string;
    yearsExperiences: number;
    specialties: string[];
    ubications: string[];
  };
}

interface ScheduleAppointmentArgs {
  idDoctor: string;
  appointment: {
    date: string;
    schedule: {
      time: string;
      patient: string;
      note: string;
    };
  };
}

export default {
  Mutation: {
    async createDoctor(_: any, { doctor }: CreateDoctorArgs) {
      const count = await Doctor.countDocuments();
      const reviews = Array.from(Array(generateRandom(3, 8))).map(() => ({
        username: faker.internet.userName(),
        comment: faker.lorem.words(generateRandom(30, 50)),
        score: generateRandom(1, 10),
      }));

      const { name, lastname, yearsExperiences, specialties, ubications } = doctor;
      const newDoctor = new Doctor({
        name,
        lastname,
        yearsExperiences,
        specialties,
        ubications,
        reviews,
        imageNumber: count + 1,
      });

      try {
        await newDoctor.save();

        return {
          msg: "Doctor creado satisfactoriamente.",
        };
      } catch (err) {
        throw new Error(err);
      }
    },
    async scheduleAppointment(_: any, { idDoctor, appointment }: ScheduleAppointmentArgs) {
      console.log(appointment);

      try {
        const doctorFound: any = await Doctor.findById(idDoctor);

        if (!doctorFound) throw new Error("Este doctor no existe");
      } catch (err) {
        console.log(err);

        throw new Error(err);
      }
    },
  },
};

function generateRandom(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
